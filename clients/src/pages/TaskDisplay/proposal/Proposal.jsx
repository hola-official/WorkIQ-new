import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/format";
import { Button } from "@chakra-ui/react";
import { useAxiosInstance } from "../../../../api/axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useShowToast from "@/hooks/useShowToast";
import Spinner from "@/components/Spinner";
import useAuth from "@/hooks/useAuth";
import RegisterUserBtn from "@/components/web3/RegisterUserBtn";

function Proposal() {
  const { taskId, sectionId } = useParams();
  const [task, setTask] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState()
  const navigate = useNavigate();
  const { showToast } = useShowToast();
  const axiosInstance = useAxiosInstance();
  const { _id: userId } = useAuth()

  useEffect(() => {
    handleGetTaskInfo();
    handleGetUserInfo()
  }, []);

  const handleGetUserInfo = async () => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`)
      const data = res.data;
      console.log(data)
      setUser(data)
    } catch (error) {
      console.error(error);

    }
  }
  const handleGetTaskInfo = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`tasks/${taskId}`);
      const data = await res.data;
      console.log(data);
      setTask(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(coverLetter);

    try {
      await axiosInstance.post(
        `tasks/${taskId}/section/${sectionId}/create-proposal`,
        {
          coverLetter,
        }
      );
      // Proposal created successfully
      showToast("Success", "Proposal submitted successfully", "success");
      // You can redirect the user or show a success message
      navigate(-1);
    } catch (error) {
      console.error("Error creating proposal:", error);
      showToast("Error", error.response.data.message, "error");
      // Handle error, show error message to user, etc.
    } finally {
      setLoading(false);
    }
  };

  console.log(taskId, sectionId);
  console.log(user)

  if (loading) {
    return <Spinner />; // Show loading state until user data is fetched
  }

  return (
    <>
      <div className=" flex flex-col gap-8 py-16 px-20">
        <h1 className="text-xl md:text-4xl font-bold">Submit a Proposal</h1>
        <div className="border-solid border-2 border-gray-200 rounded-xl px-4 py-5 mt-2">
          <h1 className="text-base md:text-2xl font-bold">Job details</h1>

          <div className="flex justify-between flex-col md:flex-row items-center gap-2">
            <div className=" flex flex-col gap-4">
              <h1 className="text-base md:text-lg font-medium">
                Looking for someone who can extract source code from my React.js
                build i have previous code too
              </h1>
              <div className="flex gap-2 items-center">
                {/* <p className="text-md text-gray-600">
                <strong>Posted: </strong>
                {getTimestamp(new Date(task.createdAt))}
              </p> */}
              </div>
              <p className="text-sm md:text-base w-[60%]">
                Looking for someone who can extract source code from my react.Js
                /app build i have the old version source code of the new build
                but i don't have the new updated source code
              </p>
            </div>
            <div className="md:border-l-2 md:border-solid md:border-gray-200 flex item">
              <div className="px-4">
                <div className="flex gap-1 text-base">
                  <p className="w-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      role="img"
                    >
                      <path
                        vectorEffect="non-scaling-stroke"
                        stroke="var(--icon-color, #001e00)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M13.17 3H21v7.83L10.83 21 3 13.17 13.17 3z"
                      ></path>
                      <path
                        vectorEffect="non-scaling-stroke"
                        stroke="var(--icon-color, #001e00)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9.63 11.51a1.86 1.86 0 00.3 2.56 1.86 1.86 0 002.56.3 1.51 1.51 0 00.27-1.68c-.25-.54-.87-1.56-1.08-2.12A1.4 1.4 0 0112 9.12a1.84 1.84 0 012.55.31 1.84 1.84 0 01.33 2.57m-.31-2.57l.81-.81m-6.26 6.26l.81-.81m7.94-7.39a.55.55 0 100-1.1.55.55 0 000 1.1z"
                      ></path>
                    </svg>
                  </p>
                  {formatPrice(50)}
                </div>
                <p className="text-sm">Fixed</p>
              </div>
            </div>
          </div>
        </div>

        <div className=" flex flex-col gap-2 border-solid border-2 border-gray-200 rounded-xl px-4 py-5 mt-2">
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-2 border-solid border-2 border-gray-200 rounded-xl px-4 py-5 mt-2"
          >
            <label
              htmlFor="coverLetter"
              className="block mb-2 text-sm md:text-lg font-medium text-gray-900 dark:text-white"
            >
              Cover Letter
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              // {...register("coverLetter", {
              //   required: "Cover letter is required",
              //   minLength: {
              //     value: 150,
              //     message: "Cover letter must be at least 150 characters long",
              //   },
              //   maxLength: {
              //     value: 500,
              //     message: "Cover letter cannot exceed 500 characters",
              //   },
              // })}
              rows="4"
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            ></textarea>
            {/* {errors.coverLetter && (
              <span className="text-red-500">{errors.coverLetter.message}</span>
            )} */}

            <div className="flex gap-2">
              {!user?.paymentWallet || !user?.paymentWalletRegisterComplete === true && <p className="text-red-500">The section you want to apply for is posted with crypto click on register to be able to apply</p>}

              {!user?.paymentWallet || !user?.paymentWalletRegisterComplete === true ?
                <RegisterUserBtn className={'float-right mb-4'} label={"Register"} />
                :
                (<Button
                  colorScheme="blue"
                  size={["sm", "md"]}
                  isDisabled={!coverLetter}
                  type="submit"
                  borderRadius="lg"
                >
                  {loading ? "Submitting proposal..." : "Submit a proposal"}
                </Button>)
              }
              <Button
                variant="ghost"
                size={["sm", "md"]}
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Proposal;
