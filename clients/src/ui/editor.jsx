import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";

import React from "react";



function RTEditor({ name, value, setValue, editorRef, field }) {
	const pathname = window.location.pathname;

	let placeholder;
	if (pathname.includes("edit-course")) {
		placeholder = `What you'll learn, Requirements, Description, Who is this course for, etc `;
	} else {
		placeholder = ``;
	}

	const editorConfig = {
		placeholder: placeholder,
		extraPlugins: [MentionLinks],
		
		mention: {
			feeds: [
				{
					marker: "@",
					feed: [
						{ id: "@cflores", avatar: "m_1", name: "Charles Flores" },
						{ id: "@gjackson", avatar: "m_2", name: "Gerald Jackson" },
						{ id: "@wreed", avatar: "m_3", name: "Wayne Reed" },
						{ id: "@lgarcia", avatar: "m_4", name: "Louis Garcia" },
						{ id: "@rwilson", avatar: "m_5", name: "Roy Wilson" },
						{ id: "@mnelson", avatar: "m_6", name: "Matthew Nelson" },
						{ id: "@rwilliams", avatar: "m_7", name: "Randy Williams" },
						{ id: "@ajohnson", avatar: "m_8", name: "Albert Johnson" },
						{ id: "@sroberts", avatar: "m_9", name: "Steve Roberts" },
						{ id: "@kevans", avatar: "m_10", name: "Kevin Evans" },
						{ id: "@mwilson", avatar: "w_1", name: "Mildred Wilson" },
						{ id: "@mnelson", avatar: "w_2", name: "Melissa Nelson" },
						{ id: "@kallen", avatar: "w_3", name: "Kathleen Allen" },
						{ id: "@myoung", avatar: "w_4", name: "Mary Young" },
						{ id: "@arogers", avatar: "w_5", name: "Ashley Rogers" },
						{ id: "@dgriffin", avatar: "w_6", name: "Debra Griffin" },
						{ id: "@dwilliams", avatar: "w_7", name: "Denise Williams" },
						{ id: "@ajames", avatar: "w_8", name: "Amy James" },
						{ id: "@randerson", avatar: "w_9", name: "Ruby Anderson" },
						{ id: "@wlee", avatar: "w_10", name: "Wanda Lee" },
					],
					itemRenderer: customItemRenderer,
				},
				{
					marker: "#",
					feed: [
						"#american",
						"#asian",
						"#baking",
						"#breakfast",
						"#cake",
						"#caribbean",
						"#chinese",
						"#chocolate",
						"#cooking",
						"#dairy",
						"#delicious",
						"#delish",
						"#dessert",
						"#desserts",
						"#dinner",
						"#eat",
						"#eating",
						"#eggs",
						"#fish",
						"#food",
						"#foodgasm",
						"#foodie",
						"#foodporn",
						"#foods",
						"#french",
						"#fresh",
						"#fusion",
						"#glutenfree",
						"#greek",
						"#grilling",
						"#halal",
						"#homemade",
						"#hot",
						"#hungry",
						"#icecream",
						"#indian",
						"#italian",
						"#japanese",
						"#keto",
						"#korean",
						"#lactosefree",
						"#lunch",
						"#meat",
						"#mediterranean",
						"#mexican",
						"#moroccan",
						"#nom",
						"#nomnom",
						"#paleo",
						"#poultry",
						"#snack",
						"#spanish",
						"#sugarfree",
						"#sweet",
						"#sweettooth",
						"#tasty",
						"#thai",
						"#vegan",
						"#vegetarian",
						"#vietnamese",
						"#yum",
						"#yummy",
					],
				},
			],
		},
	};

	// const handleChange = (event, editor) => {
	// 	const data = editor.getData();
	// 	console.log(data)
	// 	// setValue(data);

	// 	field.onChange(data);

	// 	// console.log(name, e.value)
	// };

	return (
		<CKEditor
			className="min-h-200"
			editor={Editor}
			data={value}
			config={editorConfig}
			onReady={(editor) => {
				editorRef.current = editor;
				// addDataCopyAttribute(editor);

				// You can store the "editor" and use when it is needed.
				console.log("Editor is ready to use!", editor);
			}}
	
			onBlur={field.onBlur}
			onChange={(event, editor) => {
				const data = editor.getData();

				field.onChange(data);
				// console.log("Editor change:", editor, data);
			}}
		/>
	
	);
}
export default React.memo(RTEditor);

function customItemRenderer(item) {
	const itemElement = document.createElement("span");
	const avatar = document.createElement("img");
	const userNameElement = document.createElement("span");
	const fullNameElement = document.createElement("span");

	itemElement.classList.add("mention__item");

	avatar.src = `https://example.com/avatars/${item.avatar}.jpg`;

	userNameElement.classList.add("mention__item__user-name");
	userNameElement.textContent = item.id;

	fullNameElement.classList.add("mention__item__full-name");
	fullNameElement.textContent = item.name;

	itemElement.appendChild(avatar);
	itemElement.appendChild(userNameElement);
	itemElement.appendChild(fullNameElement);

	return itemElement;
}

function MentionLinks(editor) {
	editor.conversion.for("upcast").elementToAttribute({
		view: {
			name: "a",
			key: "data-mention",
			classes: "mention",
			attributes: {
				href: true,
			},
		},
		model: {
			key: "mention",
			value: (viewItem) =>
				editor.plugins.get("Mention").toMentionAttribute(viewItem),
		},
		converterPriority: "high",
	});

	editor.conversion.for("downcast").attributeToElement({
		model: "mention",
		view: (modelAttributeValue, { writer }) => {
			if (!modelAttributeValue) {
				return;
			}

			let href;
			if (modelAttributeValue.id[0] === "@") {
				href = `mailto:${modelAttributeValue.id.slice(1)}@example.com`;
			} else {
				href = `https://example.com/social/${modelAttributeValue.id.slice(1)}`;
			}

			return writer.createAttributeElement(
				"a",
				{
					class: "mention",
					"data-mention": modelAttributeValue.id,
					href,
				},
				{
					priority: 20,
					id: modelAttributeValue.uid,
				}
			);
		},
		converterPriority: "high",
	});
}
