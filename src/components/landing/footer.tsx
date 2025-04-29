import Container from "../global/container";

const Footer = () => {
    return (
        <footer className="flex flex-col relative items-center justify-center border-t border-foreground/5 pt-16 pb-8 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32">
            <Container>
                <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-base md:text-lg font-medium text-foreground">
                        Waves
                    </span>
                    <p className="text-muted-foreground mt-2 text-sm text-center max-w-md">
                        An AI-powered platform designed to streamline and enhance your marketing workflow, helping you create, manage, and optimize campaigns effortlessly.
                    </p>
                </div>
            </Container>

            <Container delay={0.5} className="w-full relative mt-12 lg:mt-20">
                <div className="mt-8 md:flex md:items-center justify-center w-full">
                    <p className="text-sm text-muted-foreground mt-8 md:mt-0 text-center">
                        &copy; {new Date().getFullYear()} Waves. All rights reserved.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
