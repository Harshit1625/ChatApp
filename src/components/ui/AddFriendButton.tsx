"use client";

import { FC, useState } from "react";
import Button from "./Button";
import { addFriendValidation } from "@/lib/validations/add-friend";
import axios from "axios";
import { z } from "zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidation>;

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const [showStatus, setShowStatus] = useState<boolean>(false);

  // resolver for all inputs in the form

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidation),
  });

  const addFriend = async (email: string) => {
    try {
      //validator specifically for email
      const emailValidator = addFriendValidation.parse({ email });

      await axios.post("/api/friends/add", {
        email: emailValidator,
      });

      setShowStatus(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: "zod error :-" + error.message });
        return;
      }
      if (error instanceof AxiosError) {
        setError("email", { message: "Axios error :-" + error.response?.data });
        return;
      }

      setError("email", { message: "Something went wrong" });
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
    <label
      htmlFor='email'
      className='block text-sm font-medium leading-6 text-gray-900'>
      Add friend by E-Mail
    </label>

    <div className='mt-2 flex gap-4'>
      <input
        {...register('email')}
        type='text'
        className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
        placeholder='you@example.com'
      />
      <Button isLoading={false}>Add</Button>
    </div>
    <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
    {showStatus ? (
      <p className='mt-1 text-sm text-green-600'>Friend request sent!</p>
    ) : null}
  </form>
  );
};

export default AddFriendButton;
