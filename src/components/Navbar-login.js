'use client';

import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import Link from "next/link";

export default function Navigation() {
    return (
        <Navbar fluid rounded>
            <NavbarBrand as={Link} href="/">
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Tether Read</span>
            </NavbarBrand>
            <NavbarToggle />
            <NavbarCollapse>
                <NavbarLink href="/login" active >Login </NavbarLink>
                <NavbarLink href="/signup">SignUp</NavbarLink>
                {/* <NavbarLink href="/about">About</NavbarLink> */}
            </NavbarCollapse>
        </Navbar>
    );
}

