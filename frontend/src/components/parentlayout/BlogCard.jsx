import { useNavigate } from "react-router-dom";

const BlogCard = ({ img, headlines, excerpt, id }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (id) {
            navigate(`/blog/${id}`);
        }
    };

    return (
        <div
            className=" w-full lg:w-1/4 p-2 space-y-2 rounded-lg cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
            style={{ boxShadow: "0px 3px 8px rgba(0,0,0,0.24)" }}
            onClick={handleClick}
        >
            <img
                className=" h-64 md:h-96 lg:h-40 w-full rounded-lg"
                src={img}
                alt="img"
            />
            <h2 className=" text-lg text-center font-semibold">{headlines}</h2>
            <p className=" text-center text-sm">
                {excerpt ||
                    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae, repellendus suscipit. Rerum consequatur magni expedita."}
            </p>
        </div>
    );
};

export default BlogCard;
