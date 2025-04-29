import Wrapper from "@/components/global/wrapper";
import Features from "@/components/landing/features";
import Hero from "@/components/landing/hero";
import "../globals.css"
const HomePage = () => {
    return (
        <Wrapper className="py-20 relative">
            <Hero />
            <Features />
        </Wrapper>
    )
};

export default HomePage
