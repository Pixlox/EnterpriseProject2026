 easy is it to use? What is the learning curve? Are there lots of resources available to help you learn?
Vue is considered quite easy to pick up in the web dev community, as long as you have a solid foundational knowledge. The learning curve is not as steep compared to other frameworks, and Vue is additionally one of the most popular frameworks available, making resources easy to find. Additionally, I am quite familiar with Vue myself.
How is data used/processed/stored in the technology?
Vue manages all data client side using its reactivity system, re-rendering the UI when data changes. It will send and receive data with a Node.js backend.
How does the technology integrate with the other tools/technologies?
Vue will communicate with the Express Node.js backeVue.js - Frontend Framework
What is the role of the tool/technology in your system?
I aim to make my system completely from scratch programmatically, using JavaScript, HTML and CSS. I will utilise a frontend framework for this, as it makes the process easier, and the overall product much more professional. I have chosen to use Vue.js to build the UI for the entire application.
Explain the extent at which it allows collaboration with other developers or your stakeholders
Vue projects are broken into individual component files, making it easy for other developers to work on different parts of the project, without any conflicts. The codebase can also be collaborated on via Git, and can allow stakeholders to view recent versions of the project quickly.
Hownd through HTTP requests, and Leaflet.js map components are loaded directly as components.
Is there a cost associated with purchasing and/or using the technology?
No cost, and open source.



Node.js w/ Express - Backend
What is the role of the tool/technology in your system?
Node.js runs the backend server, handling report submissions, status updates, and data retrieval. It acts as the bridge between the Vue frontend and the SQLite database.
Explain the extent at which it allows collaboration with other developers or your stakeholders
Collaboration is the same as Vue, simple files that can be shared via GitHub (Git).
How easy is it to use? What is the learning curve? Are there lots of resources available to help you learn?
Node.js utilises the same language as the frontend, JavaScript. The learning curve is considered to be quite easy.
How is data used/processed/stored in the technology?
JSON is used to handle and process data to send to SQLite.
How does the technology integrate with the other tools/technologies?
Node will connect directly to the SQLite database via a library. The whole stack can run locally with no external services.
Is there a cost associated with purchasing and/or using the technology?
No cost, and open source.


Leaflet.js w/ OpenStreetMap - Mapping
What is the role of the tool/technology in your system?
Leaflet.js renders an interactive map that lets residents click to pin the exact location of where their issue is. The council dashboard will also use it to show the markers on a map.
Explain the extent at which it allows collaboration with other developers or your stakeholders
It is a Vue component and can be collaborated on the same way anything else in Vue is.
How easy is it to use? What is the learning curve? Are there lots of resources available to help you learn?
It is quite simple, and very popular. Implementing it is as easy as using any other Vue component.
How is data used/processed/stored in the technology?
Leaflet does not store any data. It is simply a renderer.
How does the technology integrate with the other tools/technologies?
Leaflet will also connect directly to Vue via a library. 
Is there a cost associated with purchasing and/or using the technology?
No cost, and open source. OpenStreetMap data is additionally completely free.



GitHub - Version Control
What is the role of the tool/technology in your system?
GitHub will host the Git repository for this project. It will provide version control and easy collaboration with other hypothetical developers.
Explain the extent at which it allows collaboration with other developers or your stakeholders
GitHub is considered to be the best way to collaborate with other developers. It is very simple to make changes and deploy them with minimal interference with other developers.
How easy is it to use? What is the learning curve? Are there lots of resources available to help you learn?
Git, using GitHub is very easy to pick up. It is also the most popular Git repository hosting site, so many, many resources are available. The GitHub Desktop application makes it even easier.
How is data used/processed/stored in the technology?
Git stores the entire codebase, but will not store the SQLite database, or any other potentially sensitive data.
How does the technology integrate with the other tools/technologies?
Git connects very easily to code editors, and every other technology listed here.
Is there a cost associated with purchasing and/or using the technology?
GitHub is completely free. GitHub Pro is provided to students at no cost as well.



Identifying and defining
Guiding steps for your enterprise project.
Describe the problem (or opportunity) and why you have selected it for this project.
Councils in Sydney often receive a large amount of community issue reports, for issues such as potholes, damaged signage, graffiti, dumping, and overall maintenance. These reports are usually handled through emails, or generic web forms, resulting in incomplete information, and delays in categorisation and the response to the issue. I thought of this idea as I was walking along my street, and noticed a sign that had seemingly been rammed over, and hadn’t been amended for weeks. 
Seeing this, I thought it would be a great idea to create a streamlined analytics platform to improve communication between residents and Sydney councils. This project also requires secure data handling, database management, data visualisation, and workflow management, which are all key concepts that we have covered.

Analyse the problem (or opportunity) to determine the system requirements including the scale and scope.
The system must support two primary user groups: residents (public users), and council staff (internal users). Residents must be able to submit reports, and be able to provide information, such as location on a map (perhaps via OpenStreetMap), upload photos, and self-categorise issues. To reduce duplicate issues, the system should also display existing reports before submission, along with their current remediation status.
Council staff will then receive these reports on their own dashboard. Features should include categorisation, priority assignment, workflow tracking (submitted, assigned, in progress, resolved), filtering, and performance analytics, such as response time and issue density heatmaps.

Establish criteria to evaluate the success of this project.
The success of this project depends on its functionality, usability, and performance. The project must allow accurate submission, storage, categorisation and status tracking of issues without data loss. Council users must be able to update and manage reports efficiently, as well. The system, overall, should aim to greatly improve efficiency when compared to e-mail based, or web reporting systems.
Residents must also be able to efficiently submit a report as well, preferably in under 3 minutes. This would require a clear, intuitive interface. For the council’s dashboard, I wish to present all analytics in a meaningful and clear manner as well.
Security criteria will also be implemented, such as authentication and data validation, however since this is not a proper council project, it will not be completed extensively.

Explain how these requirements were determined including the use of research, discussion and feedback.


Outline the tools and processes required for the development of this new system.
The front-end systems will be developed using a frontend framework, such as Vue. This will require CSS, JS and HTML knowledge. A backend environment such as Node.js will be used, with a relational database, like SQLite or PostgreSQL. SQL will be used to structure, normalise and query report data.

