<script>
import { onMount } from 'svelte';
 import { StreamChat } from 'stream-chat/dist/index.js';

	export let appName;

	let loggedIn = false;
	let online = false;
	let token = '';
  let username = '';
	let message = '';
  let messages = [];
  let channel = null;
  let user = null;
  let streamClient = null;
	let pingInterval = 30000; // 30 seconds

	
  const initializeStreamChat = async () => {
		if (!user) return;

    const { username } = user;
    streamClient = new StreamChat(process.env.streamChatKey);
    await streamClient.setUser({ id: username, name: username, role: 'admin' }, token);
	};
	
  const initializeChannel = () => {
		channel = streamClient.channel('livestream', 'kongchat', { name: appName });

    return channel.watch();
	};

	const joinChat = (_) => {
		if (!username) {
			alert('Username is empty');
			return;
		}

		fetch(`${process.env.kongHost}/api/kongchat/token`, { 
			method: 'POST',
			body: JSON.stringify({ username }),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(response => response.ok ? response.json() : ({}))
      .then((response) => {
        user = response.user;
				token = response.token;
      })
      .then(initializeStreamChat)
      .then(initializeChannel)
      .then((room) => {
        loggedIn = true;
				messages = room.messages;
				
        channel.on('message.new', ({ message: { text, user } }) => {
          messages = [...messages, { text, user }];
        });
      })
      .catch(console.error);
	};
	
  const send = (_) => {
    channel.send({ text: message });
    message = '';
	};

	const pingService = () => {
		fetch(`${process.env.kongHost}/api/kongchat/ping`, { method: 'GET' })
			.then(response => response.ok ? response.json() : ({ message: 'not pong' }))
			.then(({ message }) => {
				online = message === 'pong';
			})
			.finally(() => {
				setTimeout(pingService, pingInterval);
			});
	};
	
	onMount(() => {
		pingService();
	});
</script>

<main>
	<h1 class="text-4xl text-center">
		{appName}
	</h1>

	{#if online}
		<span class="bg-green-500 rounded-full h-5 w-5 flex mx-auto"></span>
	{:else}
		<span class="bg-red-500 rounded-full h-5 w-5 flex mx-auto"></span>
	{/if}

	{#if loggedIn}
		<div class="container mx-auto">
			<h5>You are <strong>{user.username}</strong></h5>
			<br>

			{#each messages as message}
				<div class="w-full max-w my-1">
					<div class="border border-gray-400 bg-white rounded p-4 flex flex-col justify-between leading-normal">
						<div class="mb-8">
							<p class="text-gray-700 text-base">{message.text}</p>
						</div>
						<div class="flex items-center">
							<div class="text-sm">
								<p class="text-gray-900 leading-none">By {message.user.id === user.username ? 'You' : message.user.name}</p>
							</div>
						</div>
					</div>
				</div>
			{/each}

      <form>
				<div class="flex items-center border-b border-b-2 border-teal-500 py-2 mb-10">
					<input bind:value={message} class="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Message">
					<button on:click|preventDefault={send} class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded" type="button">
						Send
					</button>
				</div>
      </form>
		</div>
  {:else}
		<div class="w-full mx-auto max-w-xs">
			<form on:submit|preventDefault={joinChat} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
				<div class="mb-4">
					<label class="block text-gray-700 text-sm font-bold mb-2" for="username">
						Username
					</label>
					<input bind:value={username} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">
				</div>
				<div class="flex items-center justify-between">
					<button class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
						Sign In
					</button>
				</div>
			</form>
		</div>
  {/if}
	<p class="text-center text-gray-500 text-xs inset-x-0 bottom-0 absolute">
		&copy;{new Date().getFullYear()} {appName}
	</p>
</main>

<style global>
	@tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>