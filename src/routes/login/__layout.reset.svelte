<script>
	import PromptArea from '$lib/components/common/promptArea.svelte';
	import ToastArea from '$lib/components/common/toastArea.svelte';
</script>

<slot />

<ToastArea />
<PromptArea />
