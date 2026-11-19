<script lang="ts">
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { resolve } from '$app/paths';

	const { children, data } = $props();

	const initials = $derived(
		data.username
			.split(/\s+/)
			.filter(Boolean)
			.map((part: string) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
</script>

<header class="flex items-center gap-4 border-b px-4 py-2">
	<a href={resolve("/(protected)")} class="text-xl font-semibold">edit-it</a>
	<div class="ml-auto">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" class="rounded-full" aria-label="Account">
						<Avatar.Root>
							<Avatar.Fallback>{initials}</Avatar.Fallback>
						</Avatar.Root>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="min-w-56">
				<DropdownMenu.Label class="font-normal">
					<span class="block text-sm text-foreground">{data.username}</span>
					<span class="block truncate text-sm font-medium text-foreground">{data.email}</span>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<form method="POST" action="/login?/logout">
					<DropdownMenu.Item>
						{#snippet child({ props })}
							<button {...props} type="submit">Sign out</button>
						{/snippet}
					</DropdownMenu.Item>
				</form>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>

{@render children()}
