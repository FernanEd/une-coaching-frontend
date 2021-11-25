<script>
	import MobileLayout from '$lib/components/layout/mobileLayout.svelte';
</script>

<MobileLayout
	layoutHeading="Portal Administrativo"
	bgColor="bg-une-purple"
	tabs={[{ Reporte: '/administrativo' }]}
>
	<slot />
</MobileLayout>
