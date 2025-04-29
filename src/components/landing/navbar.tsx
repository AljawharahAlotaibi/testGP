import Link from "next/link";
import Wrapper from "../global/wrapper";

import MobileMenu from "./mobile-menu";
import Image from "next/image";
import { Button } from "@chakra-ui/react";

const Navbar = () => {
    return (
        <header className="sticky top-0 w-full h-16 bg-background/80 backdrop-blur-sm z-50">
            <Wrapper className="h-full">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            {/* Replaced the Icon with the logo image */}
                            <Image src="/images/logo.png" alt="Waves Logo" className="w-6" width={50} height={50} />
                            <span className="text-xl font-semibold hidden lg:block">
                                Waves
                            </span>
                        </Link>
                    </div>

                    {/* <div className="hidden lg:flex items-center gap-4">
                        <ul className="flex items-center gap-8">
                            {NAV_LINKS.map((link, index) => (
                                <li key={index} className="text-sm font-medium -1 link">
                                    <Link href={link.href}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div> */}

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden lg:block">
                            <Button variant="outline">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register" className="hidden lg:block">
                            <Button variant="blue">
                                Register
                            </Button>
                        </Link>
                        <MobileMenu />
                    </div>
                </div>
            </Wrapper>
        </header>
    )
};

export default Navbar;
