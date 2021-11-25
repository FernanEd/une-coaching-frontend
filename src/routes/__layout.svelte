<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch, session, stuff }) {
		const goLogin = {
			status: 302,
			redirect: '/login',
		};

		const goThrough = {
			status: 200,
		};

		if (page.path == '/login') return goThrough;
		if (!session.isLoggedIn) return goLogin;

		console.log(session);

		return goThrough;
	}
</script>

<script>
	import { session } from '$app/stores';
	import PromptArea from '$lib/components/common/promptArea.svelte';
	import ToastArea from '$lib/components/common/toastArea.svelte';
	import '../app.postcss';
</script>

{#if $session.isLoggedIn}
	<slot />
{:else}
	<slot name="login" />
{/if}

<ToastArea />
<PromptArea />
