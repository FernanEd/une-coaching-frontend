<script>
	import MobileLayout from '$lib/components/layout/mobileLayout.svelte';
</script>

<MobileLayout
	layoutHeading="Portal Instructor"
	bgColor="bg-une-green"
	tabs={[{ 'Mis cursos': '/instructor/mis-cursos' }]}
>
	<slot />
</MobileLayout>
