import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CircleDollarSign,
  File,
  LayoutDashboard,
} from "lucide-react";
import { CalendarIcon } from "@chakra-ui/icons";
import { IconBadge } from "@/components/ui/icon-badge";
import { Banner } from "@/components/ui/banner";
import { SectionActions } from "./components/SectionActions";
import { SectionTitleForm } from "./components/SectionTitleForm";
import { SectionDescriptionForm } from "./components/SectionDescriptionForm";
import { SectionPriceForm } from "./components/SectionPriceForm";
import { AttachmentForm } from "./components/AttachmentForm";
import { SectionDurationForm } from "./components/SectionDurationForm";
import { useAxiosInstance } from "../../../../../../api/axios";
import Spinner from "@/components/Spinner";
import PaymentCheck from "./components/PaymentCheck";

const EditSection = () => {
  const { taskId, sectionId } = useParams();
  const [task, setTask] = useState();
  const [section, setSection] = useState(null);
  const [refetchSection, setRefetchSection] = useState(0)
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();
  console.log(taskId, sectionId);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const response = await axiosInstance.get(`/tasks/${taskId}`);
        const task = response.data;
        if (task) {
          const allSections = task.sections;
          const section = allSections.find(
            (section) => section._id === sectionId
          );
          setSection(section);
        }
        setTask(task);
      } catch (error) {
        console.error("Error fetching section:", error);
      }
    };
    fetchSection();
  }, [taskId, refetchSection]);

  if (!section) {
    return <Spinner />;
  }

  console.log(task)
  console.log(section)

  const requiredFields = [
    section.title,
    section.description,
    section.durationDays,
    section.price,
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  const usdc = (
    <svg width="48" height="48" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="cb-icon cb-icon-usdc pointer-events-none" aria-hidden="true" data-testid="icon-usdc" focusable="false" role="img"><path d="M15 30c8.313 0 15-6.688 15-15 0-8.313-6.688-15-15-15C6.687 0 0 6.687 0 15c0 8.313 6.687 15 15 15Z" fill="#2775CA"></path><path fill-rule="evenodd" clipRule="evenodd" d="M6.3 11.624c-1.812 4.812.688 10.25 5.563 12 .188.125.375.375.375.562v.875c0 .125 0 .188-.062.25-.063.25-.313.375-.563.25a11.244 11.244 0 0 1-7.312-7.312C2.426 12.31 5.676 5.999 11.613 4.124c.063-.063.188-.063.25-.063.25.063.375.25.375.5v.875c0 .313-.125.5-.375.625C9.301 7 7.238 9 6.301 11.624zm11.626-7.25c.062-.25.312-.375.562-.25a11.335 11.335 0 0 1 7.313 7.375c1.875 5.937-1.375 12.25-7.313 14.125-.062.062-.187.062-.25.062-.25-.062-.375-.25-.375-.5v-.875c0-.312.125-.5.375-.625 2.563-.937 4.625-2.937 5.563-5.562 1.812-4.813-.688-10.25-5.563-12-.187-.125-.375-.375-.375-.625v-.875c0-.125 0-.188.063-.25z" fill="#fff"></path><path d="M19.294 16.985c0-2.187-1.312-2.937-3.937-3.25-1.875-.25-2.25-.75-2.25-1.625s.625-1.437 1.875-1.437c1.125 0 1.75.375 2.062 1.312a.47.47 0 0 0 .438.313h1c.25 0 .437-.188.437-.438v-.062a3.122 3.122 0 0 0-2.812-2.563v-1.5c0-.25-.188-.437-.5-.5h-.938c-.25 0-.437.188-.5.5v1.438c-1.875.25-3.062 1.5-3.062 3.062 0 2.063 1.25 2.875 3.875 3.188 1.75.312 2.312.687 2.312 1.687s-.875 1.688-2.062 1.688c-1.625 0-2.188-.688-2.375-1.625-.063-.25-.25-.375-.438-.375h-1.062a.427.427 0 0 0-.438.437v.063c.25 1.562 1.25 2.687 3.313 3v1.5c0 .25.187.437.5.5h.937c.25 0 .438-.188.5-.5v-1.5c1.875-.313 3.125-1.625 3.125-3.313z" fill="#fff"></path></svg>
  )
  return (
    <>
      {!section.isPublished && (
        <Banner
          variant="warning"
          label="This task is unposted. It will not be visible in the task"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              to={`/clients/edit-task/${taskId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to task setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Section Creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
              <SectionActions
                disabled={!isComplete}
                taskId={task?._id}
                sectionId={sectionId}
                isPublished={section.isPublished}
                section={section}
                task={task}
                onSectionUpdate={setRefetchSection}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your section</h2>
              </div>
              <SectionTitleForm
                initialData={section}
                taskId={taskId}
                setRefetchSection={setRefetchSection}
                sectionId={sectionId}
              />
              <SectionDescriptionForm
                initialData={section}
                setRefetchSection={setRefetchSection}
                taskId={taskId}
                sectionId={sectionId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your task</h2>
              </div>
              <SectionPriceForm
                taskPrice={task.price}
                initialData={section}
                taskId={taskId}
                setRefetchSection={setRefetchSection}
                sectionId={sectionId}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CalendarIcon} />
                <h2 className="text-xl">Add a duration</h2>
              </div>
              <SectionDurationForm
                initialData={section}
                taskId={taskId}
                setRefetchSection={setRefetchSection}
                sectionId={sectionId}
              />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">Resources & Attachments</h2>
              </div>
              <AttachmentForm
                initialData={section}
                taskId={taskId}
                setRefetchSection={setRefetchSection}
                sectionId={sectionId}
              />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="cb-icon cb-icon-usdc pointer-events-none" aria-hidden="true" data-testid="icon-usdc" focusable="false" role="img"><path d="M15 30c8.313 0 15-6.688 15-15 0-8.313-6.688-15-15-15C6.687 0 0 6.687 0 15c0 8.313 6.687 15 15 15Z" fill="#2775CA"></path><path fill-rule="evenodd" clipRule="evenodd" d="M6.3 11.624c-1.812 4.812.688 10.25 5.563 12 .188.125.375.375.375.562v.875c0 .125 0 .188-.062.25-.063.25-.313.375-.563.25a11.244 11.244 0 0 1-7.312-7.312C2.426 12.31 5.676 5.999 11.613 4.124c.063-.063.188-.063.25-.063.25.063.375.25.375.5v.875c0 .313-.125.5-.375.625C9.301 7 7.238 9 6.301 11.624zm11.626-7.25c.062-.25.312-.375.562-.25a11.335 11.335 0 0 1 7.313 7.375c1.875 5.937-1.375 12.25-7.313 14.125-.062.062-.187.062-.25.062-.25-.062-.375-.25-.375-.5v-.875c0-.312.125-.5.375-.625 2.563-.937 4.625-2.937 5.563-5.562 1.812-4.813-.688-10.25-5.563-12-.187-.125-.375-.375-.375-.625v-.875c0-.125 0-.188.063-.25z" fill="#fff"></path><path d="M19.294 16.985c0-2.187-1.312-2.937-3.937-3.25-1.875-.25-2.25-.75-2.25-1.625s.625-1.437 1.875-1.437c1.125 0 1.75.375 2.062 1.312a.47.47 0 0 0 .438.313h1c.25 0 .437-.188.437-.438v-.062a3.122 3.122 0 0 0-2.812-2.563v-1.5c0-.25-.188-.437-.5-.5h-.938c-.25 0-.437.188-.5.5v1.438c-1.875.25-3.062 1.5-3.062 3.062 0 2.063 1.25 2.875 3.875 3.188 1.75.312 2.312.687 2.312 1.687s-.875 1.688-2.062 1.688c-1.625 0-2.188-.688-2.375-1.625-.063-.25-.25-.375-.438-.375h-1.062a.427.427 0 0 0-.438.437v.063c.25 1.562 1.25 2.687 3.313 3v1.5c0 .25.187.437.5.5h.937c.25 0 .438-.188.5-.5v-1.5c1.875-.313 3.125-1.625 3.125-3.313z" fill="#fff"></path></svg>
                <h2 className="text-xl">Select crypto for payment</h2>
              </div>
              <PaymentCheck
                initialData={section}
                taskId={taskId}
                sectionId={sectionId}
                setRefetchSection={setRefetchSection}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditSection;
