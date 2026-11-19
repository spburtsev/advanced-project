<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import FileTree from './workspaces/[workspace_id]/filetree.svelte';
	import RightSidebar from './workspaces/[workspace_id]/right-sidebar.svelte';

	const { children, data } = $props();

	let collapsed = $state(false);
	let chatHidden = $state(false);

	const initials = $derived(
		data.username
			.split(/\s+/)
			.filter(Boolean)
			.map((part: string) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

	const showFileTree = $derived(Boolean(page.params.workspace_id));
	const workspaceAction = $derived(`/workspaces/${page.params.workspace_id}`);
</script>

<div class="flex h-svh overflow-hidden">
	<aside
		id="app-sidebar"
		class={collapsed ? 'hidden' : 'flex w-60 shrink-0 flex-col border-r bg-sidebar'}
	>
		<a href={resolve('/(protected)')} class="px-4 py-3 text-xl font-semibold">edit-it</a>
		<div class="min-h-0 flex-1 overflow-auto">
			{#if showFileTree}
				<div class="flex items-center gap-1 pe-1">
					<h2 class="min-w-0 flex-1 truncate px-4 py-1 text-sm font-medium">
						{page.data.workspace.name}
					</h2>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon-sm" aria-label="Workspace actions">
									<EllipsisIcon />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" class="w-56">
							<form method="POST" action="{workspaceAction}?/rename" use:enhance class="grid gap-2 p-1.5">
								<Input
									name="name"
									required
									maxlength={200}
									value={page.data.workspace.name}
									aria-label="Workspace name"
								/>
								<Button type="submit" size="sm">Rename</Button>
							</form>
							<DropdownMenu.Separator />
							<form method="POST" action="{workspaceAction}?/delete" use:enhance>
								<DropdownMenu.Item variant="destructive" class="w-full text-left">
									{#snippet child({ props })}
										<button {...props} type="submit">Delete</button>
									{/snippet}
								</DropdownMenu.Item>
							</form>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				{#if page.form?.message && page.form.scope !== 'send'}
					<p class="px-4 pb-1 text-xs text-destructive">{page.form.message}</p>
				{/if}
				<FileTree />
			{/if}
		</div>
		<div class="border-t p-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" class="h-auto w-full justify-start gap-2 px-2" aria-label="Account">
							<Avatar.Root>
								<Avatar.Fallback>{initials}</Avatar.Fallback>
							</Avatar.Root>
							<span class="truncate text-sm">{data.username}</span>
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content side="top" align="start" class="min-w-56">
					<DropdownMenu.Label class="font-normal">
						<span class="block text-sm text-foreground">{data.username}</span>
						<span class="block truncate text-sm font-medium text-foreground">{data.email}</span>
					</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<form method="POST" action="/login?/logout">
						<DropdownMenu.Item class="w-full text-left">
							{#snippet child({ props })}
								<button {...props} type="submit">Sign out</button>
							{/snippet}
						</DropdownMenu.Item>
					</form>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</aside>
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
		<div class="flex shrink-0 items-center px-2 py-1.5">
			<Button
				variant="ghost"
				size="icon-sm"
				type="button"
				aria-controls="app-sidebar"
				aria-expanded={!collapsed}
				aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				onclick={() => (collapsed = !collapsed)}
			>
				<PanelLeftIcon />
			</Button>
			{#if showFileTree}
				<Button
					class="ms-auto"
					variant="ghost"
					size="icon-sm"
					type="button"
					aria-controls="chat-sidebar"
					aria-expanded={!chatHidden}
					aria-label={chatHidden ? 'Show chat' : 'Hide chat'}
					onclick={() => (chatHidden = !chatHidden)}
				>
					<MessageSquareIcon />
				</Button>
			{/if}
		</div>
		<div class="min-h-0 flex-1 overflow-auto">
			{@render children()}
		</div>
	</div>
	{#if showFileTree && !chatHidden}
		<RightSidebar />
	{/if}
</div>
