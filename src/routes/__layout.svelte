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
	import '../app.postcss';
</script>

{#if $session.isLoggedIn}
	<slot />
{:else}
	<slot name="login" />
{/if}
