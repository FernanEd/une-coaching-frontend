<script>
	import PromptArea from '$lib/components/common/promptArea.svelte';
	import ToastArea from '$lib/components/common/toastArea.svelte';
</script>

<svelte:head>
	<title>UNE Coaching</title>
</svelte:head>

<slot />

<ToastArea />
<PromptArea />
