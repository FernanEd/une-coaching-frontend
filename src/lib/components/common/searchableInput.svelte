<script lang="ts">
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	export let selected: number | undefined = undefined;
	export let listToSearch: any[];
	export let searchFields: string[];

	let showList = false;
	let filterText: string | undefined = selected
		? listToSearch.find((item) => item.id == selected).nombre.toString()
		: undefined;
</script>

<input
	class="w-full"
	type="text"
	placeholder="Escriba para buscar..."
	on:input={() => {
		selected = 0;
	}}
	bind:value={filterText}
	on:blur={() => {
		showList = false;
	}}
	on:focus={() => {
		showList = true;
	}}
/>

{#if showList}
	<div class="fixed bg-white border index-10">
		{#each makeArraySearchable(listToSearch, searchFields, filterText) as item, i (i)}
			<p
				class="p-2 hover:bg-accent hover:text-white cursor-pointer"
				on:mousedown={() => {
					filterText = searchFields.map((f) => item[f].toString()).join(' ');
					selected = item.id;
				}}
			>
				{searchFields.map((f) => item[f].toString()).join(' ')}
			</p>
		{/each}
	</div>
{/if}
