<script lang="ts">
	import { makeArraySearchable } from '$lib/utils/makeArraySearchable';

	export let selected: number | null = null;
	export let listToSearch: any[];
	export let searchFields: string[];
	export let isRequired: boolean = false;
	export let valueKey: string = 'id';
	export let displayRelative = false;

	let showList = false;
	let filterText: string | undefined = selected
		? searchFields
				.map((f) => {
					let foundItem = listToSearch.find(
						(item) => item[valueKey] == selected
					);

					if (foundItem) return foundItem[f];
				})
				.join(' ')
		: undefined;
</script>

<div class="relative h-[34px]">
	<select
		class="absolute opacity-0"
		required={isRequired}
		value={selected ? 1 : undefined}
		tabindex={-1}
	>
		<option value="" />
		<option value={1} />
	</select>

	<input
		class=" w-full absolute border "
		placeholder="Escriba para buscar..."
		class:bg-neutral-200={selected}
		type="search"
		on:input={() => {
			selected = null;
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

<!-- <div class="relative"> -->
{#if showList}
	<div
		class={displayRelative
			? 'relative bg-white border z-10 max-h-60 overflow-y-scroll '
			: `absolute bg-white border z-10 max-h-60 overflow-y-scroll translate-y-12 w-[576px]`}
	>
		{#each makeArraySearchable(listToSearch, searchFields, filterText) as item, i (i)}
			<p
				class="p-2 hover:bg-accent hover:text-white cursor-pointer"
				on:mousedown={() => {
					filterText = searchFields.map((f) => item[f].toString()).join(' ');
					selected = item[valueKey];
				}}
			>
				{searchFields.map((f) => item[f].toString()).join(' ')}
			</p>
		{/each}
	</div>
{/if}
<!-- </div> -->
