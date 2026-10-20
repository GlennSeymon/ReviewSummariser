import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export interface Message {
	content: string;
	role: 'user' | 'bot';
}

interface Props {
	messages: Message[];
}

const ChatMessages = ({ messages }: Props) => {
	const onCopyMessage = (e: React.ClipboardEvent) => {
		const selection = window.getSelection()?.toString().trim();
		if (selection) {
			e.preventDefault();
			e.clipboardData.setData('text/plain', selection);
		}
	};
	const lastMessageRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	return (
		<div className='flex flex-col gap-3'>
			{messages.map((message, index) => (
				<div
					key={index}
					className={`px-3 py-1 max-w-md rounded-xl ${message.role === 'user' ? 'bg-blue-600 text-white self-end' : 'bg-gray-100 text-black self-start'}`}
					onCopy={onCopyMessage}
					ref={index === messages.length - 1 ? lastMessageRef : null}
				>
					<ReactMarkdown>{message.content}</ReactMarkdown>
				</div>
			))}
		</div>
	);
};

export default ChatMessages;
