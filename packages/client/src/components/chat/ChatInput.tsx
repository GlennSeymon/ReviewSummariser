import React from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowUpFromBracket } from 'react-icons/fa6';
import { Button } from '../ui/button';

export interface ChatFormData {
	prompt: string;
}

interface Props {
	onSubmit: (data: ChatFormData) => void;
}

const ChatInput = ({ onSubmit }: Props) => {
	const { register, handleSubmit, reset, formState } = useForm<ChatFormData>();

	const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	const submit = handleSubmit((data) => {
		reset({ prompt: '' });
		onSubmit(data);
	});

	return (
		<form
			onSubmit={submit}
			onKeyDown={handleKeyDown}
			className='flex flex-col gap-2 items-end border-2 p-4 rounded-3xl'
		>
			<textarea
				{...register('prompt', {
					required: true,
					validate: (data) => data.trim().length > 0,
				})}
				className='w-full border-0 focus:outline-0 resize-none'
				placeholder='Ask anything'
				maxLength={1000}
				autoFocus
			/>
			<Button type='submit' className='rounded-full w-9 h-9 p-0' disabled={!formState.isValid}>
				<FaArrowUpFromBracket />
			</Button>
		</form>
	);
};

export default ChatInput;
