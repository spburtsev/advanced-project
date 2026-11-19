<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import { Badge } from '#lib/components/ui/badge/index.js';
</script>

<div class="flex h-screen flex-col items-center justify-center">
	<h1>{page.status} {page.error?.message}</h1>
	<a href={resolve(`/(protected)`)}>
		<Badge>
			Go to the home page
			<ArrowUpRightIcon data-icon="inline-end" />
		</Badge>
	</a>
</div>
