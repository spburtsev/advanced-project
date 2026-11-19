<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import FileIcon from '@lucide/svelte/icons/file';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	type FileTreeItem = { name: string } | { name: string; items: FileTreeItem[] };

	const fileTree: FileTreeItem[] = [
		{
			name: 'components',
			items: [
				{
					name: 'ui',
					items: [
						{ name: 'button.svelte' },
						{ name: 'card.svelte' },
						{ name: 'dialog.svelte' },
						{ name: 'input.svelte' },
						{ name: 'select.svelte' },
						{ name: 'table.svelte' }
					]
				},
				{ name: 'login-form.svelte' },
				{ name: 'register-form.svelte' }
			]
		},
		{
			name: 'lib',
			items: [{ name: 'utils.ts' }, { name: 'cn.ts' }, { name: 'api.ts' }]
		},
		{
			name: 'hooks',
			items: [
				{ name: 'use-media-query.svelte.ts' },
				{ name: 'use-debounce.svelte.ts' },
				{ name: 'use-local-storage.svelte.ts' }
			]
		},
		{
			name: 'types',
			items: [{ name: 'index.d.ts' }, { name: 'api.d.ts' }]
		},
		{
			name: 'public',
			items: [{ name: 'favicon.ico' }, { name: 'logo.svg' }, { name: 'images' }]
		},
		{ name: 'app.html' },
		{ name: '+layout.svelte' },
		{ name: 'app.css' },
		{ name: 'package.json' },
		{ name: 'tsconfig.json' },
		{ name: 'README.md' },
		{ name: '.gitignore' }
	];
</script>

{#snippet treeItem(fileItem: FileTreeItem)}
	{#if 'items' in fileItem}
		<Collapsible.Root>
			<Collapsible.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="sm"
						class="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
					>
						<ChevronRightIcon class="transition-transform group-data-[state=open]:rotate-90" />
						<FolderIcon />
						{fileItem.name}
					</Button>
				{/snippet}
			</Collapsible.Trigger>
			<Collapsible.Content class="style-lyra:ml-4 mt-1 ml-5">
				<div class="flex flex-col gap-1">
					{#each fileItem.items as child (child.name)}
						{@render treeItem(child)}
					{/each}
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		<Button variant="link" size="sm" class="w-full justify-start gap-2 text-foreground">
			<FileIcon />
			<span>{fileItem.name}</span>
		</Button>
	{/if}
{/snippet}

<div class="flex flex-col gap-1 px-2 py-1">
	{#each fileTree as item (item.name)}
		{@render treeItem(item)}
	{/each}
</div>
