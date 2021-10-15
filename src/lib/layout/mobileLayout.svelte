<script lang="ts">
	import { useModal } from '$lib/stores/modal';
	import { logOut } from '$lib/utils/auth';
	import { page } from '$app/stores';
	import { currentUser } from '$lib/stores/currentUser';

	export let bgColor = 'bg-une-red';
	export let layoutHeading;
	export let tabs: { [x: string]: string }[];
	export const TABS = tabs.map((t) => {
		let key = Object.keys(t)[0];

		return {
			title: key,
			path: t[key]
		};
	});
	const menu = useModal();
</script>

{#if $menu}
	<section
		class="fixed menu-bg w-screen h-screen z-10"
		on:click|self={menu.closeModal}
	>
		<aside
			class="{bgColor} fixed 
left-0 top-0 bottom-0 
py-8 px-4 flex flex-col 
gap-20"
		>
			<section
				class="flex flex-col 
	gap-4 items-center 
	text-center"
			>
				<section class="flex flex-col gap-4 items-center">
					<img
						class="object-contain"
						src="../../../static/une white logo.png"
						alt="Une logo"
						id="logo"
					/>
				</section>
				<p class="text-gray-100">
					Conectado como {$currentUser.matricula}
				</p>
				<a href="/" class="text-white font-bold">Menú principal</a>
				<button class="font-bold text-accent-inv" on:click={logOut}
					>Cerrar sesión
				</button>
			</section>
		</aside>
	</section>
{/if}

<header>
	<section class={bgColor}>
		<div class="notch h-4" />
		<div
			class="container relative text-2xl font-bold text-white p-4 text-center"
		>
			<svg
				on:click={menu.openModal}
				class="menu-icon"
				xmlns="http://www.w3.org/2000/svg"
				height="24px"
				viewBox="0 0 24 24"
				width="24px"
				fill="#000000"
				><path d="M0 0h24v24H0V0z" fill="none" /><path
					d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
				/></svg
			>
			{layoutHeading}
		</div>
	</section>

	<nav class="container flex justify-center">
		{#each TABS as tab, i (tab)}
			<a
				href={tab.path}
				class="tab"
				class:selected={$page.path == tab.path}>{tab.title}</a
			>
		{/each}
	</nav>
</header>
<main class="max-w-md mx-auto p-4">
	<slot />
</main>

<style lang="postcss">
	.menu-bg {
		background: #00000040;
	}

	#logo {
		width: 100px;
	}

	aside {
		width: 250px;
	}

	.menu-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		fill: white;
		width: 40px;
		height: 40px;
		z-index: 0;

		transform: translateY(-50%);
	}
	.notch {
		background: #00000040;
	}
	.container {
		/* outline: 2px solid green; */
		@apply max-w-md mx-auto;
	}
	.tab {
		@apply text-text-4 bg-neutral-100 flex items-center justify-center flex-1 p-2 font-bold text-center;
	}
	.selected {
		@apply text-accent border-accent bg-white border-b-4;
	}
</style>
