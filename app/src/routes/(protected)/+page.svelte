<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const { data } = $props();
	const { workspaces } = $derived(data);
</script>

<Card.Root class="mx-4 my-4 max-w-5xl">
	<Card.Header>
		<Card.Title>Your Workspaces</Card.Title>
		<Card.Action>
			<form method="POST" action="?/newWorkspace">
				<Button type="submit">New</Button>
			</form>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Workspace</Table.Head>
					<Table.Head>Created At</Table.Head>
					<Table.Head>Members</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if workspaces.length > 0}
					{#each workspaces as workspace (workspace.id)}
						{@const created = new Date(workspace.createdAt)}
						<Table.Row>
							<Table.Cell>{workspace.name}</Table.Cell>
							<Table.Cell>
								<time datetime={created.toISOString()}>
									{created.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
								</time>
							</Table.Cell>
							<Table.Cell>{workspace.members}</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="size-8">
												<EllipsisIcon />
												<span class="sr-only">Open menu</span>
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item
											onclick={() =>
												goto(
													resolve(`/(protected)/workspaces/[workspace_id]`, {
														workspace_id: workspace.id
													})
												)}
										>
											View
										</DropdownMenu.Item>
										<DropdownMenu.Item>Rename</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<form method="POST" action="?/deleteWorkspace" use:enhance>
											<input type="hidden" name="id" value={workspace.id} />
											<DropdownMenu.Item variant="destructive" class="w-full text-left">
												{#snippet child({ props })}
													<button {...props} type="submit">Delete</button>
												{/snippet}
                                            </DropdownMenu.Item>
										</form>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="text-center">No workspaces yet</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
