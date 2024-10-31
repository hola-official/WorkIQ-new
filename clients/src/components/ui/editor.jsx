import {
	HtmlEditor,
	Image,
	Inject,
	Link,
	QuickToolbar,
	RichTextEditorComponent,
	Toolbar,
} from "@syncfusion/ej2-react-richtexteditor";
import React from "react";
// import * as React from 'react';

function Editor({ name, value, setValue }) {
	const toolbarSettings = {
		items: [
			"Bold",
			"Italic",
			"Underline",
			"StrikeThrough",
			"FontName",
			"FontSize",
			"FontColor",
			"BackgroundColor",
			"LowerCase",
			"UpperCase",
			"|",
			"Formats",
			"Alignments",
			"OrderedList",
			"UnorderedList",
			"Outdent",
			"Indent",
			"|",
			"Image",
			"CreateLink",
			"InsertCode",
			"|",
			"ClearFormat",
			"FullScreen",
			"SourceCode",
			"|",
			"Undo",
			"Redo",
		],
	};

	const insertImageSettings = {
		saveUrl: "https://ej2.syncfusion.com/services/api/uploadbox/Save",
		removeUrl: "https://ej2.syncfusion.com/services/api/uploadbox/Remove",
	};

	const handleChange = (e) => {
		setValue(e.value);

		// console.log(name, e.value)
	};

	const handleKeyDown = (e) => {
		if (e.key === "Tab") {
			e.preventDefault(); // Prevent default tab behavior
			const editor = richTextEditorRef.current.getInstance(); // Get a reference to the Syncfusion text editor instance
			const range = editor.getDocument().getSelection().getRangeAt(0); // Get current selection range
			const tabNode = document.createTextNode("\t"); // Create a text node with tab character
			range.insertNode(tabNode); // Insert tab character at the current selection position
			range.collapse(false); // Collapse range after the inserted tab character
			e.stopPropagation(); // Stop propagation to prevent other event handlers from handling the event
		}
	};

	return (
		<RichTextEditorComponent
			className="z-[100] no-tailwindcss-base"
			// height={400}
			value={value}
			placeholder={`What you'll learn, Requirements, Description, Who is this course for, etc `}
			change={handleChange}
			toolbarSettings={toolbarSettings}
			onKeyDown={handleKeyDown}
			insertImageSettings={insertImageSettings}
		>
			{/* {value} */}
			<Inject services={[Toolbar, Image, Link, HtmlEditor, QuickToolbar]} />
		</RichTextEditorComponent>
	);
}
export default React.memo(Editor)
