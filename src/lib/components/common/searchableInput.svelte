<script lang="ts">
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	export let selected: number | undefined = undefined;
	export let listToSearch: any[];
	export let searchFields: string[];
	export let isRequired: boolean = false;

	let hasBeenSelected: number | undefined;

	let showList = false;
	let filterText: string | undefined = selected
		? listToSearch.find((item) => item.id == selected).nombre.toString()
		: undefined;

	$: console.log(hasBeenSelected);
</script>

<div class="relative h-[34px]">
	<select
		class="absolute opacity-0"
		required={isRequired}
		bind:value={hasBeenSelected}
	>
		<option value="" />
		<option value={1} />
	</select>

	<input
		class=" w-full absolute border "
		placeholder="Escriba para buscar..."
		class:bg-neutral-200={hasBeenSelected == 1}
		type="search"
		on:input={() => {
			selected = 0;
			hasBeenSelected = undefined;
		}}
		bind:value={filterText}
		on:blur={() => {
			showList = false;
		}}
		on:focus={() => {
			showList = true;
		}}
	/>
</div>

<div class="relative">
	{#if showList}
		<div
			class="absolute bg-white border index-10 max-h-60 overflow-y-scroll w-full"
		>
			{#each makeArraySearchable(listToSearch, searchFields, filterText) as item, i (i)}
				<p
					class="p-2 hover:bg-accent hover:text-white cursor-pointer"
					on:mousedown={() => {
						filterText = searchFields.map((f) => item[f].toString()).join(' ');
						selected = item.id;
						hasBeenSelected = 1;
					}}
				>
					{searchFields.map((f) => item[f].toString()).join(' ')}
				</p>
			{/each}
		</div>
	{/if}
</div>
