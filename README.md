<p align="center">
    <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="center" width="30%">
</p>
<p align="center"><h1 align="center">VIBE</h1></p>
<p align="center">
	<em>Unlock the Vibe: Elevate Your Project with Stability and Consistency!</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/mdkulkarni2005/vibe?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/mdkulkarni2005/vibe?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/mdkulkarni2005/vibe?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/mdkulkarni2005/vibe?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center"><!-- default option, no dependency badges. -->
</p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>
<br>

## 🔗 Table of Contents

- [📍 Overview](#-overview)
- [� GitHub OAuth Setup](#-github-oauth-setup)
- [�👾 Features](#-features)
- [📁 Project Structure](#-project-structure)
  - [📂 Project Index](#-project-index)
- [🚀 Getting Started](#-getting-started)
  - [☑️ Prerequisites](#-prerequisites)
  - [⚙️ Installation](#-installation)
  - [🤖 Usage](#🤖-usage)
  - [🧪 Testing](#🧪-testing)
- [📌 Project Roadmap](#-project-roadmap)
- [🔰 Contributing](#-contributing)
- [🎗 License](#-license)
- [🙌 Acknowledgments](#-acknowledgments)

---

## 📍 Overview

Vibe is an open-source project solving the challenge of managing dependencies and ensuring version consistency in Next.js applications. Key features include a locked `package-lock.json`, tailored `next.config.ts`, and strict TypeScript settings in `tsconfig.json`. Ideal for developers seeking a stable and reproducible environment for collaborative projects.

---

## � GitHub OAuth Setup

> **New!** Vibe now uses GitHub OAuth for seamless repository creation. Users authorize once through GitHub's official OAuth flow, and repositories are created automatically without manual token input.

### Quick Setup (5 minutes)

See [QUICK_START.md](QUICK_START.md) for a rapid setup guide, or [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md) for comprehensive instructions.

**Summary:**
1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Add credentials to `.env`:
   ```bash
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```
3. Run `npx prisma generate`
4. Users can now connect GitHub with one click! 🎉

---

## �👾 Features

|      | Feature         | Summary       |
| :--- | :---:           | :---          |
| ⚙️  | **Architecture**  | <ul><li>Microservices architecture</li><li>Containerized with Docker</li><li>Uses TypeScript for backend and frontend</li></ul> |
| 🔩 | **Code Quality**  | <ul><li>Linting with ESLint</li><li>Type-safe with TypeScript</li><li>Follows best practices for clean code</li></ul> |
| 📄 | **Documentation** | <ul><li>Extensive documentation in TypeScript</li><li>Includes API documentation</li><li>Code examples and usage guidelines</li></ul> |
| 🔌 | **Integrations**  | <ul><li>Integrates with various libraries and tools</li><li>Uses TRPC for server-client communication</li><li>Utilizes Prisma for database operations</li></ul> |
| 🧩 | **Modularity**    | <ul><li>Component-based architecture</li><li>Separation of concerns</li><li>Reusable and maintainable codebase</li></ul> |
| 🧪 | **Testing**       | <ul><li>Comprehensive test suite with Jest</li><li>Includes unit, integration, and end-to-end tests</li><li>Test coverage reports</li></ul> |
| ⚡️  | **Performance**   | <ul><li>Optimized for speed and efficiency</li><li>Caching strategies implemented</li><li>Performance monitoring and tuning</li></ul> |
| 🛡️ | **Security**      | <ul><li>Security best practices followed</li><li>Input validation and sanitization</li><li>Regular security audits</li></ul> |
| 📦 | **Dependencies**  | <ul><li>Uses a wide range of dependencies</li><li>Manages dependencies with npm</li><li>Includes both frontend and backend libraries</li></ul> |

---

## 📁 Project Structure

```sh
└── vibe/
    ├── README.md
    ├── components.json
    ├── eslint.config.mjs
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── prisma
    │   ├── migrations
    │   └── schema.prisma
    ├── public
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── logo.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    ├── sandbox-templates
    │   └── nextjs
    ├── src
    │   ├── # Add Clerk to Next.md
    │   ├── app
    │   ├── components
    │   ├── hooks
    │   ├── inngest
    │   ├── lib
    │   ├── middleware.ts
    │   ├── modules
    │   ├── prompt.ts
    │   ├── trpic
    │   └── types.ts
    └── tsconfig.json
```


### 📂 Project Index
<details open>
	<summary><b><code>VIBE/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/package-lock.json'>package-lock.json</a></b></td>
				<td>- The `package-lock.json` file in the project serves as a crucial component for managing dependencies and ensuring version consistency<br>- It defines the specific versions of external packages required for the project, such as "@clerk/nextjs", "@clerk/themes", "@e2b/code-interpreter", "@hookform/resolvers", "@inngest/agent-kit", and "@prisma/client"<br>- By locking in these dependencies, the file helps maintain a stable and reproducible environment for the project, ensuring that all collaborators are working with the same set of dependencies.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/next.config.ts'>next.config.ts</a></b></td>
				<td>- Define the project's Next.js configuration settings in the provided next.config.ts file<br>- This file specifies the configuration options for the Next.js framework, influencing how the project behaves and is built.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- Configures TypeScript compiler options for the project, targeting ES2017 with strict settings<br>- Enables JSX preservation, module bundling, and JSON module resolution<br>- Maps paths for easier imports<br>- Excludes node_modules from compilation.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/eslint.config.mjs'>eslint.config.mjs</a></b></td>
				<td>- Generates ESLint configuration by importing and extending rules from predefined configurations for Next.js projects<br>- The code sets up a FlatCompat instance to handle configuration extensions based on the project's base directory<br>- The resulting ESLint configuration includes rules for Next.js core web vitals and TypeScript.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/postcss.config.mjs'>postcss.config.mjs</a></b></td>
				<td>- Configures Tailwind CSS plugin for PostCSS in the project, enhancing styling capabilities<br>- This setup ensures seamless integration of Tailwind utilities for efficient styling across the codebase architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/package.json'>package.json</a></b></td>
				<td>- Define project dependencies and scripts for development, building, and starting the application<br>- The package.json file specifies essential configurations, such as project name, version, private status, and dependencies like Next.js, React, and various UI components<br>- It also includes development tools like ESLint, TypeScript, and Tailwind CSS for efficient development workflows.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/components.json'>components.json</a></b></td>
				<td>- Defines project configuration settings, including style, resource usage, TypeScript support, Tailwind CSS setup, aliases for file paths, and icon library choice<br>- This file plays a crucial role in structuring the project and ensuring consistency across components and utilities.</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- sandbox-templates Submodule -->
		<summary><b>sandbox-templates</b></summary>
		<blockquote>
			<details>
				<summary><b>nextjs</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/sandbox-templates/nextjs/e2b.toml'>e2b.toml</a></b></td>
						<td>- Define E2B sandbox template config for creating Next.js sandboxes using Python or JS SDK<br>- Includes team ID, start command, Dockerfile, template name, and ID for seamless sandbox creation.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/sandbox-templates/nextjs/compile_page.sh'>compile_page.sh</a></b></td>
						<td>- Ensures the Next.js app is running and compiles the `/` page during sandbox template building by pinging the server until a successful response is received<br>- This script guarantees the proper functioning of the application before proceeding with the build process.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/sandbox-templates/nextjs/e2b.Dockerfile'>e2b.Dockerfile</a></b></td>
						<td>Optimize Dockerfile for Next.js app by installing dependencies, customizing sandbox, and moving app to home directory.</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- src Submodule -->
		<summary><b>src</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/types.ts'>types.ts</a></b></td>
				<td>Define the data structure for tree items in the project, enabling hierarchical representation of strings.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/middleware.ts'>middleware.ts</a></b></td>
				<td>- Implements middleware for authentication and route protection based on public and private routes<br>- Utilizes Clerk for Next.js server integration<br>- Defines route matchers and configurations to control access to specific routes within the project architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/prompt.ts'>prompt.ts</a></b></td>
				<td>- The code file `prompt.ts` provides prompts for generating user-friendly messages and descriptive titles based on task summaries in a custom Next.js app<br>- It guides the final agent in summarizing what was built or changed in a casual tone, ensuring concise and clear communication with the user<br>- This file plays a crucial role in facilitating effective user interaction and understanding of the application's functionality.</td>
			</tr>
			</table>
			<details>
				<summary><b>lib</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/lib/usage.ts'>usage.ts</a></b></td>
						<td>- Provide functions to track, consume, and check usage status based on user plan<br>- Utilizes RateLimiterPrisma for rate limiting with points allocated according to plan<br>- Ensures authenticated user before processing actions<br>- Enhances user experience by managing credits efficiently.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/lib/download-utils.ts'>download-utils.ts</a></b></td>
						<td>- The `download-utils.ts` file in the project's `src/lib` directory contains code that creates a complete Next.js project template structure<br>- It utilizes JSZip to generate a template with root configuration files like `package.json`, setting up essential scripts and dependencies for a Next.js project<br>- This function is crucial for scaffolding new Next.js projects with predefined configurations, enabling developers to kickstart their projects efficiently.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/lib/db.ts'>db.ts</a></b></td>
						<td>- Manages the database connection using PrismaClient, ensuring a single instance is shared across the application<br>- Handles the initialization and configuration of the Prisma client based on the environment, promoting efficient database operations within the project architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/lib/utils.ts'>utils.ts</a></b></td>
						<td>- Converts files into a tree structure for a TreeView component, ensuring consistent ordering<br>- The function takes a record of file paths and content, organizing them into a hierarchical format suitable for display<br>- This utility enhances the user experience by presenting files in a structured and intuitive manner within the application.</td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>modules</b></summary>
				<blockquote>
					<details>
						<summary><b>usage</b></summary>
						<blockquote>
							<details>
								<summary><b>server</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/usage/server/procedures.ts'>procedures.ts</a></b></td>
										<td>- Defines a TRPC router in the usage module to fetch usage status securely<br>- The router leverages a protected procedure to query the usage status by calling the getUsageStatus function from the usage library<br>- In case of any errors, it gracefully handles the exception by returning null.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>projects</b></summary>
						<blockquote>
							<details>
								<summary><b>server</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/server/procedures.ts'>procedures.ts</a></b></td>
										<td>- Manages project procedures, including fetching, creating, and downloading projects securely<br>- Validates user input, handles credit consumption, and ensures user permissions for project access<br>- Integrates with external services for project execution and data ingestion<br>- Maintains project and fragment ownership verification to prevent unauthorized access.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>ui</b></summary>
								<blockquote>
									<details>
										<summary><b>components</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/components/message-form.tsx'>message-form.tsx</a></b></td>
												<td>- Implement a message form component that enables users to submit messages within a project<br>- The form handles validation, submission, and displays usage information if available<br>- It integrates with external services for message creation and updates UI elements dynamically based on form state.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/components/project-header.tsx'>project-header.tsx</a></b></td>
												<td>- Implements a dynamic project header component that integrates with project data and allows users to navigate and customize appearance settings<br>- The component leverages dropdown menus for a seamless user experience, showcasing project details and offering theme customization options.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/components/message-loading.tsx'>message-loading.tsx</a></b></td>
												<td>- Implements a loading message feature for the Vibe project UI components<br>- Displays a series of messages in a shimmer effect to indicate ongoing background processes<br>- Enhances user experience by providing visual feedback during data fetching and processing operations.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/components/fragment-web.tsx'>fragment-web.tsx</a></b></td>
												<td>- Implements a React component for displaying and interacting with a web fragment<br>- Allows users to refresh, copy, and open the fragment in a new tab<br>- The component dynamically updates the fragment key and handles clipboard interactions for the fragment's URL.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/components/message-card.tsx'>message-card.tsx</a></b></td>
												<td>- The `MessageCard` component renders user or assistant messages with optional fragments and timestamps<br>- It dynamically displays different message types based on the role provided, enhancing the user experience by presenting messages in a structured and visually appealing manner within the project's UI components.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/components/messages-container.tsx'>messages-container.tsx</a></b></td>
												<td>- Manages the display and interaction of messages within a project, including real-time updates and user input<br>- Automatically scrolls to the latest message, highlights active fragments, and provides a form for new messages<br>- Ensures a seamless messaging experience for users interacting with the project.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/components/usage.tsx'>usage.tsx</a></b></td>
												<td>- The `Usage` component displays user credits and reset time, offering an upgrade option for non-pro users<br>- It leverages date-fns for time calculations and integrates with the Clerk authentication library<br>- This component enhances the user experience by providing clear information and prompting users to upgrade for additional features.</td>
											</tr>
											</table>
										</blockquote>
									</details>
									<details>
										<summary><b>views</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/projects/ui/views/project-view.tsx'>project-view.tsx</a></b></td>
												<td>- Enables viewing and managing project details, including code and demo, with options to download code and add authentication<br>- Handles project header, messages, and tab navigation for previewing and editing code<br>- Allows upgrading to pro plan and user control.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>messages</b></summary>
						<blockquote>
							<details>
								<summary><b>server</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/messages/server/procedures.ts'>procedures.ts</a></b></td>
										<td>- Defines procedures for handling messages within the project, including fetching, creating, and adding Clerk authentication<br>- Ensures messages are associated with the correct project and user<br>- Manages credit consumption for message creation<br>- Integrates with Inngest for processing Clerk authentication instructions<br>- Maintains data integrity and security by verifying user permissions.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>home</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/home/constants.ts'>constants.ts</a></b></td>
								<td>- Define project templates for various applications with emojis, titles, and prompts<br>- Each template guides developers in building specific UI components and features for projects like Netflix clone, admin dashboard, kanban board, file manager, YouTube clone, store page, Airbnb clone, and Spotify clone.</td>
							</tr>
							</table>
							<details>
								<summary><b>ui</b></summary>
								<blockquote>
									<details>
										<summary><b>components</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/home/ui/components/projects-list.tsx'>projects-list.tsx</a></b></td>
												<td>- Displays a list of projects with user-specific details and project information<br>- Utilizes client-side data fetching and user authentication for a personalized experience<br>- Projects are presented in a visually appealing grid layout with project names, last updated timestamps, and clickable links for further exploration.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/home/ui/components/project-form.tsx'>project-form.tsx</a></b></td>
												<td>- Enables users to create new projects with a form that validates and submits project details<br>- Handles form submission, error handling, and redirects upon successful project creation<br>- Integrates with various libraries for form management, state handling, and API interactions<br>- Supports template selection for project creation.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/modules/home/ui/components/navbar.tsx'>navbar.tsx</a></b></td>
												<td>- Implements a responsive Navbar component for the Vibe project, featuring dynamic user authentication controls and scroll behavior<br>- The component leverages Next.js and Clerk for seamless user interactions, enhancing the overall user experience within the application.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>components</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/file-explorer.tsx'>file-explorer.tsx</a></b></td>
						<td>- Enables interactive file exploration and viewing within the project UI<br>- Displays a tree structure of files, allows file selection, and provides a code view with syntax highlighting<br>- Users can copy file contents to the clipboard<br>- The component enhances user experience by offering a seamless file browsing and viewing interface.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/user-control.tsx'>user-control.tsx</a></b></td>
						<td>- Defines a user control component that leverages the current theme and user settings to render a customizable user button<br>- The component integrates with the Clerk authentication service and supports dynamic theming based on the user's preferences.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/hint.tsx'>hint.tsx</a></b></td>
						<td>- Defines a reusable Hint component that displays tooltips for user guidance<br>- The component wraps children elements with a tooltip trigger and content, allowing customization of tooltip position and alignment<br>- This enhances user experience by providing contextual information in a visually appealing manner.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/tree-view.tsx'>tree-view.tsx</a></b></td>
						<td>- Generates a dynamic tree view component for displaying hierarchical data structures<br>- The component allows users to navigate through a tree structure, selecting items and triggering actions based on user interactions<br>- The tree view enhances user experience by providing a visually organized representation of complex data.</td>
					</tr>
					</table>
					<details>
						<summary><b>ui</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/context-menu.tsx'>context-menu.tsx</a></b></td>
								<td>- Defines and exports components for a context menu UI, facilitating interactive user actions within the application<br>- The components include triggers, items, labels, separators, and shortcuts, enhancing the user experience by providing a structured and intuitive interface for context-specific interactions.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/accordion.tsx'>accordion.tsx</a></b></td>
								<td>- Implement UI components for an accordion feature in the React project<br>- The code defines functions for the accordion, accordion items, triggers, and content<br>- These components utilize Radix UI for accordion functionality and Lucide icons for visual elements<br>- The code enhances user experience by enabling collapsible content sections with smooth animations.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/alert-dialog.tsx'>alert-dialog.tsx</a></b></td>
								<td>- Defines reusable components for an alert dialog interface, including triggers, overlays, content, headers, footers, titles, descriptions, actions, and cancel buttons<br>- Facilitates consistent and customizable alert dialog implementation within the project's UI components.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/radio-group.tsx'>radio-group.tsx</a></b></td>
								<td>- Defines reusable RadioGroup and RadioGroupItem components for handling radio inputs in a React application<br>- These components leverage Radix UI for consistent styling and functionality across the codebase.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/checkbox.tsx'>checkbox.tsx</a></b></td>
								<td>- Implements a custom Checkbox component using Radix UI and Lucide icons<br>- Manages checkbox state and appearance, enhancing user interaction and accessibility.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/input-otp.tsx'>input-otp.tsx</a></b></td>
								<td>- Defines reusable React components for handling OTP input fields, groups, slots, and separators<br>- Encapsulates logic for rendering and managing OTP input elements within the UI, enhancing modularity and reusability across the codebase architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/sheet.tsx'>sheet.tsx</a></b></td>
								<td>- The code file in src/components/ui/sheet.tsx defines components for a customizable sheet interface, including triggers, content, headers, footers, titles, and descriptions<br>- These components facilitate the creation of dynamic and interactive sheets within the project's user interface, enhancing user experience and providing a structured layout for displaying information.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/progress.tsx'>progress.tsx</a></b></td>
								<td>- Defines a reusable Progress component for displaying progress indicators in the UI<br>- It leverages Radix UI's ProgressPrimitive components to render a visually appealing progress bar with customizable styles and values<br>- The component encapsulates logic for managing and displaying progress, enhancing the user experience within the application.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/badge.tsx'>badge.tsx</a></b></td>
								<td>- Defines and exports a Badge component with variant styles for different visual states<br>- Utilizes class-variance-authority for managing variant classes<br>- Integrates with React to render a badge element with specified variant and additional props.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/breadcrumb.tsx'>breadcrumb.tsx</a></b></td>
								<td>- Defines reusable components for breadcrumbs in the UI, including items, links, separators, and ellipses<br>- Facilitates easy navigation and visual hierarchy within the application interface.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/sidebar.tsx'>sidebar.tsx</a></b></td>
								<td>- The code file `sidebar.tsx` in the `src/components/ui` directory is responsible for managing the sidebar functionality within the project<br>- It handles the display and interaction logic for the sidebar component, including its width, state persistence, and keyboard shortcut<br>- The file integrates various UI components and utilities to create a cohesive user experience for navigating the application.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/pagination.tsx'>pagination.tsx</a></b></td>
								<td>- Defines reusable components for pagination in a React application<br>- Includes elements like previous/next buttons, ellipsis for page navigation<br>- Enhances user experience by providing intuitive navigation controls for browsing content.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/label.tsx'>label.tsx</a></b></td>
								<td>Defines a reusable UI component for labels in the project, enhancing accessibility and styling consistency across the codebase.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/scroll-area.tsx'>scroll-area.tsx</a></b></td>
								<td>- Implements ScrollArea and ScrollBar components for interactive scrolling within the UI<br>- These components enhance user experience by providing smooth and customizable scrolling functionality<br>- They are crucial elements in creating a dynamic and responsive user interface within the project's component architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/input.tsx'>input.tsx</a></b></td>
								<td>Defines a reusable React Input component with customizable styling and attributes, enhancing user input experience across the project.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/textarea.tsx'>textarea.tsx</a></b></td>
								<td>Enables rendering a customizable textarea component for the UI, enhancing user interaction and visual appeal.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/separator.tsx'>separator.tsx</a></b></td>
								<td>- Implements a UI separator component that enhances visual hierarchy and layout structure within the project<br>- The component allows for easy customization of orientation and decorative styles, contributing to a cohesive user interface design.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/toggle-group.tsx'>toggle-group.tsx</a></b></td>
								<td>- Implements a toggle group component for managing toggle items with different variants and sizes<br>- The component utilizes React context to share variant and size information among toggle items<br>- This facilitates the creation of flexible and customizable toggle groups within the UI component library.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/command.tsx'>command.tsx</a></b></td>
								<td>- Enables rendering of interactive command components within the project's UI, facilitating user interaction with commands through a visually appealing interface<br>- The code file enhances user experience by providing a Command Palette feature for searching and executing commands seamlessly.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/popover.tsx'>popover.tsx</a></b></td>
								<td>- Implements UI components for popovers using Radix UI library<br>- Includes functions for Popover, PopoverTrigger, PopoverContent, and PopoverAnchor<br>- Handles popover display and behavior in a modular and reusable manner within the project's UI component architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/slider.tsx'>slider.tsx</a></b></td>
								<td>- The Slider component in src/components/ui/slider.tsx renders a customizable slider interface for user interaction<br>- It leverages React and @radix-ui/react-slider to provide a flexible and accessible slider element with options for min, max, default values, and styling<br>- This component enhances the user experience by enabling smooth value selection within a specified range.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/form.tsx'>form.tsx</a></b></td>
								<td>- Enables creation of form components with structured fields, labels, controls, descriptions, and messages<br>- Facilitates seamless integration of form elements within React applications, enhancing user interaction and accessibility.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/select.tsx'>select.tsx</a></b></td>
								<td>- Enables rendering custom select components with various interactive elements and styles, enhancing user experience and visual appeal<br>- The code file defines functions for different parts of the select component, such as trigger, content, items, separators, and scroll buttons, allowing for flexible customization and seamless integration within the project's UI architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/button.tsx'>button.tsx</a></b></td>
								<td>- Defines button component with various visual styles and sizes, utilizing class variance authority for dynamic styling<br>- Integrates with React to render buttons with specified variants and sizes, supporting customization through props<br>- Facilitates consistent UI design across the project with reusable button components.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/drawer.tsx'>drawer.tsx</a></b></td>
								<td>- Implements UI components for a drawer feature, including triggers, content, headers, and footers<br>- Manages the display and interaction of the drawer within the application interface.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/toggle.tsx'>toggle.tsx</a></b></td>
								<td>- The code in src/components/ui/toggle.tsx provides a customizable toggle component for the project's UI<br>- It leverages class variance authority to manage different visual variants and sizes, enhancing user interaction and accessibility<br>- This component encapsulates the toggle functionality, enabling seamless integration within the broader codebase architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/dialog.tsx'>dialog.tsx</a></b></td>
								<td>- The code file in src/components/ui/dialog.tsx provides reusable components for creating customizable dialog interfaces in the project<br>- These components include Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, and DialogTrigger<br>- They enable the easy implementation of interactive dialog boxes with various features like close buttons, headers, footers, titles, and descriptions.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/alert.tsx'>alert.tsx</a></b></td>
								<td>- Defines reusable Alert components with customizable variants for different visual styles and behaviors<br>- These components encapsulate alert messages, titles, and descriptions, enhancing UI consistency and flexibility across the codebase.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/carousel.tsx'>carousel.tsx</a></b></td>
								<td>- Enables creation of interactive carousels with navigation controls and content organization<br>- Facilitates smooth scrolling between items in a horizontal or vertical orientation<br>- Supports custom options and plugins for enhanced functionality<br>- Promotes accessibility and user engagement through intuitive navigation and visual cues.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/navigation-menu.tsx'>navigation-menu.tsx</a></b></td>
								<td>- Enables rendering of a customizable navigation menu with various components like menu items, triggers, and indicators<br>- Supports dynamic viewport handling and styling for a seamless user experience<br>- Facilitates easy navigation within the application interface.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/table.tsx'>table.tsx</a></b></td>
								<td>- Defines reusable table components for displaying data in a structured format within the UI<br>- Includes elements like headers, rows, cells, and captions, enhancing the presentation and organization of tabular data<br>- These components contribute to a cohesive and consistent user interface design across the project.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/tabs.tsx'>tabs.tsx</a></b></td>
								<td>- Define UI components for tabs functionality using Radix UI in the specified file path<br>- The components include Tabs, TabsList, TabsTrigger, and TabsContent, each serving a distinct purpose in managing tab interactions within the React application.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/skeleton.tsx'>skeleton.tsx</a></b></td>
								<td>- Defines a reusable UI component for creating loading skeleton effects<br>- The component applies styling classes and animations to mimic a loading state, enhancing user experience<br>- It promotes code reusability and consistency across the project's UI elements.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/switch.tsx'>switch.tsx</a></b></td>
								<td>- Implements a custom Switch component using Radix UI for consistent styling and behavior across the project's user interface components<br>- The Switch component enhances user experience by providing a visually appealing and accessible way to toggle between states.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/dropdown-menu.tsx'>dropdown-menu.tsx</a></b></td>
								<td>- Implements dropdown menu components for UI interactions within the project architecture<br>- The code defines various elements like triggers, content, items, separators, and shortcuts to enhance user experience and functionality<br>- These components are crucial for creating interactive dropdown menus with diverse features and styling options.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/collapsible.tsx'>collapsible.tsx</a></b></td>
								<td>- Expose collapsible UI components for easy integration within the project architecture<br>- The code in the provided file enables the utilization of collapsible elements, enhancing user interaction and content organization<br>- By leveraging these components, developers can create dynamic and user-friendly interfaces, contributing to a seamless user experience across the codebase.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/menubar.tsx'>menubar.tsx</a></b></td>
								<td>- Defines reusable UI components for a menubar, including triggers, content, items, labels, separators, and shortcuts<br>- Facilitates building interactive and accessible navigation menus with various styling options<br>- Supports checkboxes, radio buttons, submenus, and customizable behaviors for a dynamic user experience.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/resizable.tsx'>resizable.tsx</a></b></td>
								<td>- Implements resizable panels for UI layout in the project, enhancing user experience by allowing flexible panel resizing<br>- The code in the provided file defines components for resizable panel groups, panels, and handles, enabling dynamic adjustments to the layout based on user interactions.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/chart.tsx'>chart.tsx</a></b></td>
								<td>- Enables rendering interactive charts with customizable themes, tooltips, and legends<br>- Facilitates seamless integration of chart components within the project's UI architecture, enhancing data visualization capabilities.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/avatar.tsx'>avatar.tsx</a></b></td>
								<td>- Defines UI components for avatars with fallback support, enhancing user profile visuals<br>- The code encapsulates avatar rendering logic, promoting reusability and maintainability across the project's UI components.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/hover-card.tsx'>hover-card.tsx</a></b></td>
								<td>- Define and render interactive hover cards for UI components using Radix UI's hover card primitives<br>- Implementing hover card, trigger, and content components with customizable styling and animations for enhanced user experience.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/aspect-ratio.tsx'>aspect-ratio.tsx</a></b></td>
								<td>Implements a custom AspectRatio component using @radix-ui/react-aspect-ratio for maintaining consistent aspect ratios across UI elements in the project structure.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/calendar.tsx'>calendar.tsx</a></b></td>
								<td>- Enables rendering a customizable calendar UI component with navigation controls, day selection, and styling options<br>- Integrates with React components for seamless interaction and provides flexibility for layout adjustments.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/tooltip.tsx'>tooltip.tsx</a></b></td>
								<td>- Implements tooltip functionality for React components, providing a way to display contextual information when interacting with UI elements<br>- The code defines components for tooltip rendering, triggering, and content display, enhancing user experience within the application.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/sonner.tsx'>sonner.tsx</a></b></td>
								<td>- Enhances the user interface by integrating a custom Toaster component with dynamic theming support<br>- Uses the Next.js theme provider to adjust the Toaster appearance based on the current theme.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/ui/card.tsx'>card.tsx</a></b></td>
								<td>- Define reusable UI components for cards with header, title, description, action, content, and footer<br>- Encapsulate styling and structure for consistent card design across the application<br>- Promote code reusability and maintainability by providing modular components for building various card layouts with ease.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>code-view</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/code-view/code-theme.css'>code-theme.css</a></b></td>
								<td>- Define the GitHub Dark theme for code blocks, enhancing readability and aesthetics<br>- Set font styles and colors for various code elements to improve code viewing experience<br>- The theme includes both light and dark mode styles for better visibility in different environments.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/components/code-view/index.tsx'>index.tsx</a></b></td>
								<td>- Enables syntax highlighting for code snippets in various languages within the project's components<br>- The code dynamically applies Prism highlighting to the provided code content based on the specified language, enhancing code readability and presentation for users interacting with the application.</td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>hooks</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/hooks/use-current-theme.ts'>use-current-theme.ts</a></b></td>
						<td>- The `useCurrentTheme` hook determines the active theme based on user preferences or system settings<br>- It leverages the `useTheme` hook from Next.js to seamlessly manage theme switching within the project architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/hooks/use-mobile.ts'>use-mobile.ts</a></b></td>
						<td>- Enables detection of mobile devices by adjusting UI based on screen size<br>- The code in use-mobile.ts utilizes React hooks to determine if the user's device is mobile, triggering responsive design changes when necessary.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/hooks/use-scroll.ts'>use-scroll.ts</a></b></td>
						<td>Enables tracking user scroll behavior to trigger actions based on scroll position within the project's React components.</td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>trpic</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/trpic/query-client.ts'>query-client.ts</a></b></td>
						<td>Create a query client with default options for React Query using superjson for serialization and deserialization.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/trpic/init.ts'>init.ts</a></b></td>
						<td>- Implements authentication middleware and procedures for TRPC server using Clerk and React cache<br>- Handles user authentication and authorization checks for protected procedures<br>- Facilitates creation of TRPC context, router, caller factory, and base procedures<br>- Enhances security and access control within the codebase architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/trpic/client.tsx'>client.tsx</a></b></td>
						<td>- Enables seamless integration of TRPC and React Query by providing a centralized context for managing API requests and responses<br>- Facilitates efficient client-side data fetching and state management within the project's architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/trpic/server.tsx'>server.tsx</a></b></td>
						<td>- Facilitates creation of TRPC options proxy, ensuring server-only import, and establishing a stable query client getter<br>- Integrates TRPC context creation, query client setup, and router configuration for seamless server-side operations<br>- Enables efficient handling of server requests and responses within the project architecture.</td>
					</tr>
					</table>
					<details>
						<summary><b>routers</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/trpic/routers/_app.ts'>_app.ts</a></b></td>
								<td>- Defines the main API routes for the project by integrating routers from different modules<br>- The code organizes and exposes the necessary endpoints for handling usage, messages, and projects functionalities<br>- This centralizes the routing logic and provides a clear structure for handling API requests across the codebase architecture.</td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>app</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/layout.tsx'>layout.tsx</a></b></td>
						<td>- Defines the root layout for the project, integrating various providers and components for a cohesive user interface experience<br>- Sets up fonts, themes, and authentication appearance, while rendering children components within a structured HTML body<br>- This layout ensures consistent styling and functionality across the application.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/error.tsx'>error.tsx</a></b></td>
						<td>Defines a global error page component for the project structure.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/globals.css'>globals.css</a></b></td>
						<td>- Define global CSS variables for color, typography, shadows, and animations to maintain consistent theming across the project<br>- The file establishes a structured design system by defining key styling properties like colors, fonts, radii, shadows, and animations, ensuring a cohesive visual experience throughout the application.</td>
					</tr>
					</table>
					<details>
						<summary><b>projects</b></summary>
						<blockquote>
							<details>
								<summary><b>[projectId]</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/projects/[projectId]/page.tsx'>page.tsx</a></b></td>
										<td>- Handles prefetching and rendering project data for a specific project page<br>- Utilizes React Query for data fetching and error handling, ensuring a smooth user experience<br>- The code efficiently hydrates and displays project details, enhancing performance and reliability within the project architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>api</b></summary>
						<blockquote>
							<details>
								<summary><b>trpc</b></summary>
								<blockquote>
									<details>
										<summary><b>[trpc]</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/api/trpc/[trpc]/route.ts'>route.ts</a></b></td>
												<td>- Defines a request handler for TRPC API routes using a fetch adapter<br>- Integrates with the project's TRPC context and router setup to handle GET and POST requests at the '/api/trpc' endpoint.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
							<details>
								<summary><b>inngest</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/api/inngest/route.ts'>route.ts</a></b></td>
										<td>- Defines an API endpoint that serves functions using the Inngest client<br>- The route file establishes GET, POST, and PUT methods for interacting with the Inngest service, specifically utilizing the codeAgentFunction<br>- This code facilitates communication between the client and the functions provided by Inngest, enhancing the project's overall functionality.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>(home)</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/(home)/layout.tsx'>layout.tsx</a></b></td>
								<td>- Defines the layout structure for the home page by rendering a Navbar component and wrapping the content within a flex container<br>- The layout ensures a consistent design and navigation experience across the application.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/(home)/page.tsx'>page.tsx</a></b></td>
								<td>- Page component renders a homepage layout with a project form and a list of projects<br>- It showcases the Vibe platform, enabling users to build apps and websites through AI chat<br>- The component is structured within a flex container for responsive design.</td>
							</tr>
							</table>
							<details>
								<summary><b>sign-in</b></summary>
								<blockquote>
									<details>
										<summary><b>[[...sign-in]]</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/(home)/sign-in/[[...sign-in]]/page.tsx'>page.tsx</a></b></td>
												<td>Enables user sign-in functionality with dynamic theming based on the current theme, enhancing the user experience.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
							<details>
								<summary><b>pricing</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/(home)/pricing/page.tsx'>page.tsx</a></b></td>
										<td>Implements a pricing page that dynamically adjusts to the current theme, showcasing different pricing plans.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>sign-up</b></summary>
								<blockquote>
									<details>
										<summary><b>[[...sign-up]]</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/app/(home)/sign-up/[[...sign-up]]/page.tsx'>page.tsx</a></b></td>
												<td>- Enables user sign-up with dynamic theming based on current theme<br>- Integrates Clerk's SignUp component with custom appearance settings.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>inngest</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/inngest/types.ts'>types.ts</a></b></td>
						<td>Define a constant for the sandbox timeout duration in the project's types file.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/inngest/functions.ts'>functions.ts</a></b></td>
						<td>- Implements a code agent function that runs in a sandboxed Next.js environment<br>- The function interacts with a network of tools to execute commands, create/update files, and read files<br>- It leverages AI models to generate a summary and user-friendly message, saving results and handling errors appropriately<br>- The function ultimately returns a URL, title, files, and summary for a code fragment.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/inngest/client.ts'>client.ts</a></b></td>
						<td>Initialize an Inngest client for event handling within the project architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/src/inngest/utils.ts'>utils.ts</a></b></td>
						<td>- Defines utility functions for interacting with a code interpreter sandbox and processing agent output<br>- Includes functions to connect to a sandbox, set a timeout, extract the last assistant text message content, and parse agent output messages<br>- These utilities enhance the codebase by facilitating sandbox management and message processing for the project.</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- prisma Submodule -->
		<summary><b>prisma</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/prisma/schema.prisma'>schema.prisma</a></b></td>
				<td>- Defines data models and relationships for a PostgreSQL database using Prisma schema<br>- Models include User, Project, Message, Fragment, and Usage with specified fields and associations<br>- The schema also includes enums for MessageRole and MessageType<br>- The code generates a Prisma client for interacting with the database.</td>
			</tr>
			</table>
			<details>
				<summary><b>migrations</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/prisma/migrations/migration_lock.toml'>migration_lock.toml</a></b></td>
						<td>- Define the database provider for the project by specifying it in the migration lock file located at prisma/migrations/migration_lock.toml<br>- This file should not be manually modified and must be included in version control, such as Git.</td>
					</tr>
					</table>
					<details>
						<summary><b>20250707045207_init</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/prisma/migrations/20250707045207_init/migration.sql'>migration.sql</a></b></td>
								<td>Introduce a new column 'userId' to the 'Project' table in the database schema to establish a required relationship between projects and users.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>20250628124744_project</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/prisma/migrations/20250628124744_project/migration.sql'>migration.sql</a></b></td>
								<td>- Implements database schema changes to introduce a new 'projectId' column in the 'Message' table and creates the 'Project' table with essential fields<br>- Establishes a foreign key relationship between 'Message' and 'Project' tables for data integrity.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>20250707061821_add_user_relation</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/prisma/migrations/20250707061821_add_user_relation/migration.sql'>migration.sql</a></b></td>
								<td>Defines database schema for User and establishes foreign key relationship with Project for user identification and data integrity.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>20250707110206_usage</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/prisma/migrations/20250707110206_usage/migration.sql'>migration.sql</a></b></td>
								<td>- Define a database table named "Usage" with columns for key, points, and expiration date<br>- This file contributes to the project's architecture by managing usage data efficiently.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>20250628084831_init</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/mdkulkarni2005/vibe/blob/master/prisma/migrations/20250628084831_init/migration.sql'>migration.sql</a></b></td>
								<td>- Define database schema for messages and fragments, including message roles and types<br>- Establish relationships between messages and fragments for data integrity.</td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---
## 🚀 Getting Started

### ☑️ Prerequisites

Before getting started with vibe, ensure your runtime environment meets the following requirements:

- **Programming Language:** TypeScript
- **Package Manager:** Npm
- **Container Runtime:** Docker


### ⚙️ Installation

Install vibe using one of the following methods:

**Build from source:**

1. Clone the vibe repository:
```sh
❯ git clone https://github.com/mdkulkarni2005/vibe
```

2. Navigate to the project directory:
```sh
❯ cd vibe
```

3. Install the project dependencies:


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker build -t mdkulkarni2005/vibe .
```




### 🤖 Usage
Run vibe using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm start
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker run -it {image_name}
```


### 🧪 Testing
Run the test suite using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm test
```


---
## 📌 Project Roadmap

- [X] **`Task 1`**: <strike>Implement feature one.</strike>
- [ ] **`Task 2`**: Implement feature two.
- [ ] **`Task 3`**: Implement feature three.

---

## 🔰 Contributing

- **💬 [Join the Discussions](https://github.com/mdkulkarni2005/vibe/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/mdkulkarni2005/vibe/issues)**: Submit bugs found or log feature requests for the `vibe` project.
- **💡 [Submit Pull Requests](https://github.com/mdkulkarni2005/vibe/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/mdkulkarni2005/vibe
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/mdkulkarni2005/vibe/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=mdkulkarni2005/vibe">
   </a>
</p>
</details>

---

## 🎗 License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

## 🙌 Acknowledgments

- List any resources, contributors, inspiration, etc. here.

---
