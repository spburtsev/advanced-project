<script lang="ts">
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Message from '#lib/components/ui/message/index.js';
	import * as MessageScroller from '#lib/components/ui/message-scroller/index.js';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	const workspaceAction = $derived(`/workspaces/${page.params.workspace_id}`);
	const members = $derived(page.data.members ?? []);
	const messages = $derived(page.data.messages ?? []);
	const shown = $derived(members.slice(0, 4));
	const rest = $derived(members.length - shown.length);

	function initials(name: string) {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
	}
</script>

<aside id="chat-sidebar" class="flex w-80 shrink-0 flex-col border-l bg-sidebar min-h-0">
	<div class="flex shrink-0 flex-col gap-2 border-b p-3">
		<Avatar.Group>
			{#each shown as member (member.id)}
				<Avatar.Root>
					<Avatar.Fallback>{initials(member.name)}</Avatar.Fallback>
				</Avatar.Root>
			{/each}
			{#if rest > 0}
				<Avatar.GroupCount>+{rest}</Avatar.GroupCount>
			{/if}
		</Avatar.Group>
		<Dialog.Root>
			<Dialog.Trigger class="w-fit text-sm text-muted-foreground underline-offset-4 hover:underline">
				See all members
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Members</Dialog.Title>
					<Dialog.Description>People in this workspace.</Dialog.Description>
				</Dialog.Header>
				<ul class="flex flex-col gap-2">
					{#each members as member (member.id)}
						<li class="flex items-center gap-2">
							<Avatar.Root>
								<Avatar.Fallback>{initials(member.name)}</Avatar.Fallback>
							</Avatar.Root>
							<span class="min-w-0 flex-1 truncate text-sm">{member.name}</span>
							<span class="text-xs text-muted-foreground">{member.role}</span>
						</li>
					{/each}
				</ul>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="flex min-h-0 flex-1 flex-col">
		<MessageScroller.Provider defaultScrollPosition="end">
			<MessageScroller.Root class="min-h-0 flex-1">
				<MessageScroller.Viewport>
					<MessageScroller.Content class="gap-3 p-3">
						{#if messages.length === 0}
							<p class="text-sm text-muted-foreground">No messages yet</p>
						{:else}
							{#each messages as message (message.id)}
								{@const mine = message.authorId === page.data.userId}
								<MessageScroller.Item messageId={String(message.id)}>
									<Message.Root align={mine ? 'end' : 'start'}>
										<Message.Avatar>
											<Avatar.Root>
												<Avatar.Fallback>{initials(message.authorName ?? '?')}</Avatar.Fallback>
											</Avatar.Root>
										</Message.Avatar>
										<Message.Content>
											<Bubble.Root variant={mine ? 'default' : 'muted'}>
												<Bubble.Content class="whitespace-pre-wrap">{message.body}</Bubble.Content>
											</Bubble.Root>
											<Message.Footer>
												{new Date(message.createdAt).toLocaleTimeString(undefined, {
													timeStyle: 'short'
												})}
											</Message.Footer>
										</Message.Content>
									</Message.Root>
								</MessageScroller.Item>
							{/each}
						{/if}
					</MessageScroller.Content>
				</MessageScroller.Viewport>
				<MessageScroller.Button />
			</MessageScroller.Root>
		</MessageScroller.Provider>
		<form
			method="POST"
			action="{workspaceAction}?/send"
			class="flex gap-2 border-t p-2"
			use:enhance={({ formElement }) => {
				return async ({ update, result }) => {
					await update();
					if (result.type === 'success') formElement.reset();
				};
			}}
		>
			<Input name="body" required maxlength={2000} placeholder="Message" aria-label="Message" />
			<Button type="submit" size="sm">Send</Button>
		</form>
		{#if page.form?.scope === 'send' && page.form.message}
			<p class="px-2 pb-2 text-xs text-destructive">{page.form.message}</p>
		{/if}
	</div>
</aside>
