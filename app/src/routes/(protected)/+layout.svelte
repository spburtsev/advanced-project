<script lang="ts">
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar, Dropdown, DropdownHeader } from "flowbite-svelte";

    const { children, data } = $props();
</script>

<Navbar>
  <NavBrand href="/">
    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">edit-it</span>
  </NavBrand>
  <div class="flex items-center md:order-2">
    <Avatar id="avatar-menu" />
    <NavHamburger />
  </div>
  <Dropdown placement="bottom" triggeredBy="#avatar-menu">
    <DropdownHeader>
      <span class="block text-sm">{data.username}</span>
      <span class="block truncate text-sm font-medium">{data.email}</span>
    </DropdownHeader>
    <DropdownHeader>Sign out</DropdownHeader>
  </Dropdown>
  <NavUl>
    <NavLi href="/">Home</NavLi>
  </NavUl>
</Navbar>

{@render children()}