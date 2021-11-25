<script lang="ts">
	import { session } from '$app/stores';
	import { serverURL } from '$lib/constants/serverURL';

	const handleLogout = async () => {
		let res = await fetch(`${serverURL}/logout`, {
			credentials: 'include',
		});
		session.set({ isLoggedIn: false });
	};
</script>

<button class="font-bold text-accent-inv" on:click={handleLogout}
	>Cerrar sesión
</button>
