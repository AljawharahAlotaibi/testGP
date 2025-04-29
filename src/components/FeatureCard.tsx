import Image from "next/image";
interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
    buttonText: string;
}

const FeatureCard = ({ title, description, icon, buttonText }: FeatureCardProps) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
            <div className="flex items-center gap-3">
            <Image src={icon} alt={title} width={32} height={32} /> 
                <h2 className="text-xl font-bold text-black">{title}</h2>
            </div>
            <p className="text-gray-600 text-sm mt-3 flex-grow">{description}</p>
            <button className="mt-6 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg w-full transition-all duration-200">
                {buttonText}
            </button>
        </div>
    );
};

export default FeatureCard;
