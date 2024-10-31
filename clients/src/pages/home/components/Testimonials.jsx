import authScreenAtom from "@/atoms/authAtom";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { Button } from "@chakra-ui/react";
import { FaFireAlt } from "react-icons/fa";

const Testimonials = () => {
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const navigate = useNavigate();

  const handleRegister = () => {
    setAuthScreen("signup");
    navigate("/auth");
  };
  return (
    <div className="px-16 py-8">
      <div className="md:px-20 rounded-md md:py-10  bg-[#134848] ">
        <div className="py-5 px-10 flex flex-col gap-2 items-center">
          <div className="text-white px-5 text-center">
            <h1 className="text-xl md:text-5xl font-bold">Ready to Get Started ?</h1>
            <p className="text-base md:text-xl">
              Sign Up or Login to Explore Various Features that our Sellers &
              Freelancers Experience. <br /> It&apos;s Just Free
            </p>
          </div>
          <div>
            <Button
              onClick={handleRegister}
              colorScheme={"blue"}
              leftIcon={<FaFireAlt />}
              size={["sm", "md", "lg"]}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
