<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

{#if data.userId}
	<p>Signed in as {data.userId}</p>
{:else if data.localDev}
	<form method="GET" action={resolve('/auth/dev-login')} class="flex max-w-sm items-end gap-2">
		<div class="grow">
			<Label for="dev-name">Mock login as</Label>
			<Input id="dev-name" name="name" required autocomplete="username" />
		</div>
		<Button type="submit">Log in</Button>
	</form>
{/if}
