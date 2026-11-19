<script lang="ts">
	import * as Card from "#lib/components/ui/card/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { FieldGroup, Field, FieldLabel, FieldDescription } from "#lib/components/ui/field/index.js";
	import { Input } from "#lib/components/ui/input/index.js";

	const id = $props.id();
</script>

<div class="flex justify-center py-10">
<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/login">
			<FieldGroup>
				<Field>
					<FieldLabel for="email-{id}">Email</FieldLabel>
					<Input id="email-{id}" name="user" placeholder="m@example.com" required />
				</Field>
				<Field>
					<div class="flex items-center">
						<FieldLabel for="password-{id}">Password</FieldLabel>
						<a href="##" class="ms-auto inline-block text-sm underline"> Forgot your password? </a>
					</div>
					<Input id="password-{id}" name="password" type="password" required />
				</Field>
				<Field>
					<Button type="submit" class="w-full">Login</Button>
					<FieldDescription class="text-center">
						Don't have an account? <a href="##">Sign up</a>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>

</div>