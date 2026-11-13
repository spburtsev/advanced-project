<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
</script>

	<div class="flex justify-center py-10">
		<form method="POST" action="?/login" class="flex max-w-sm flex-col gap-2">
			<div class="grow">
				<Label for="user">Username or email</Label>
				<Input id="user" name="user" required autocomplete="username" />
				<Label for="password">Password</Label>
				<Input id="password" name="password" required type="password" />
			</div>
			<Button type="submit">Log in</Button>
		</form>
	</div>
