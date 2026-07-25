# OpenVoz System Architecture

## Purpose

This document describes the architecture of the OpenVoz platform.

Its goal is to provide a complete technical overview of how the system is designed, how components interact, and how production services are organized.

---

# High-Level Architecture

                        +----------------------+
                        |   User's Browser     |
                        | (Desktop / Mobile)   |
                        +----------+-----------+
                                   |
                              HTTPS Requests
                                   |
                                   ▼
                        +----------------------+
                        |        Nginx         |
                        | Reverse Proxy & SSL  |
                        +----------+-----------+
                                   |
                                   ▼
                        +----------------------+
                        |      Gunicorn        |
                        |   WSGI Application   |
                        +----------+-----------+
                                   |
                                   ▼
                        +----------------------+
                        |       Django         |
                        | Business Logic & API |
                        +----+-----------+-----+
                             |           |
                AI Requests   |           | Database Operations
                             |           |
                             ▼           ▼
                    +---------------+   +---------------+
                    |  OpenAI API   |   |   Database    |
                    +---------------+   +---------------+
                             |
                             ▼
                        AI Response
                             |
                             ▼
                    +---------------+
                    | Audio (gTTS)  |
                    +---------------+
                             |
                             ▼
                  +----------------------+
                  | Static & Media Files |
                  +----------------------+

### Request Flow

1. The user accesses OpenVoz through a web browser using HTTPS.
2. Nginx receives the request and serves as the reverse proxy.
3. Gunicorn forwards the request to the Django application.
4. Django processes the request and executes the application logic.
5. When AI functionality is required, Django communicates with the OpenAI API.
6. Audio responses are generated using gTTS.
7. Django returns the response to the browser, including any required static or media resources.

## Major Components

### Frontend

#### Purpose

The Frontend provides the user interface for interacting with the OpenVoz platform through a modern web browser. It is responsible for presenting content, capturing user input, playing audio responses, and communicating with the backend services.

#### Responsibilities

- Render HTML pages using Django templates.
- Display AI-generated content.
- Capture user speech through the browser.
- Play synthesized audio responses.
- Handle user interactions and navigation.
- Send asynchronous requests to the backend.

#### Main Technologies

- HTML5
- CSS3
- JavaScript (ES6)
- Django Templates
- Fetch API (AJAX)
- Web Speech API (Speech Recognition)

#### Communication

The frontend communicates exclusively with the Django backend through secure HTTPS requests.

### Backend

#### Purpose

The Backend is the core of the OpenVoz platform. It processes user requests, manages business logic, coordinates AI interactions, handles authentication, and generates responses delivered to the frontend.

#### Responsibilities

- Process HTTP requests received from the frontend.
- Execute application business logic.
- Manage user sessions and authentication.
- Coordinate communication with AI services.
- Generate text and audio responses.
- Read from and write to the database.
- Serve application APIs and endpoints.

#### Main Technologies

- Python
- Django
- Gunicorn (WSGI)
- Django ORM

#### Communication

The backend receives requests from the frontend through Gunicorn and communicates with:

- OpenAI API for AI-generated responses.
- gTTS for speech synthesis.
- The database for persistent data storage.
- Static and media file storage for application resources.

(To be completed)

### AI Services

#### Purpose

The AI Services layer provides the intelligent capabilities of the OpenVoz platform. It processes user prompts, generates contextual responses, evaluates language performance, and supports interactive speaking practice through external AI models.

#### Responsibilities

- Generate conversational responses.
- Evaluate speaking performance.
- Produce personalized feedback.
- Support interactive language-learning activities.
- Manage communication with external AI providers.

#### Main Technologies

- OpenAI API
- GPT models
- REST API integration

#### Communication

The AI Services layer is invoked exclusively by the Django backend. User requests are processed by the backend, forwarded to the OpenAI API when required, and the generated responses are returned to Django for further processing before being delivered to the frontend.

#### Design Principles

- AI processing remains independent of the user interface.
- External AI services are isolated behind the backend.
- Future AI providers can be integrated with minimal changes to the application architecture.

### Database

#### Purpose

The Database provides persistent storage for the OpenVoz platform. It stores application data, user information, configuration settings, and other records required for the operation of the system.

#### Responsibilities

- Store persistent application data.
- Manage user accounts and authentication data.
- Store AI-related application information.
- Support Django models through the Object-Relational Mapper (ORM).
- Ensure data integrity and consistency.

#### Main Technologies

- Django ORM
- SQLite (Development)
- PostgreSQL (Production, recommended)

#### Communication

The database is accessed exclusively through the Django backend using the Django ORM. Direct database access from the frontend is not permitted.

#### Design Principles

- Separate application logic from data storage.
- Protect data integrity through Django models and migrations.
- Support future migration between database engines with minimal code changes.

### Infrastructure

#### Purpose

The Infrastructure layer provides the computing environment required to deploy, operate, and maintain the OpenVoz platform in production.

#### Responsibilities

- Host the application server.
- Manage HTTPS and SSL certificates.
- Route incoming web traffic.
- Execute the Django application through Gunicorn.
- Serve static and media files.
- Monitor system availability and performance.

#### Main Technologies

- DigitalOcean Droplet
- Ubuntu Server
- Nginx
- Gunicorn
- Let's Encrypt (Certbot)
- Git & GitHub

#### Communication

Infrastructure components support all application services by providing secure networking, process management, and web server functionality.

#### Design Principles

- Secure all communication using HTTPS.
- Separate web server and application server responsibilities.
- Minimize downtime during deployments.
- Design for scalability and maintainability.
- Follow infrastructure-as-documentation principles, where deployment and operational procedures are fully documented.

---

## External Services

### Purpose

OpenVoz integrates with trusted third-party services that extend the platform's capabilities without becoming part of the core application.

### Current Services

| Service                      | Purpose                                                     |
| ---------------------------- | ----------------------------------------------------------- |
| OpenAI API                   | AI-powered conversational responses and language assessment |
| Google Text-to-Speech (gTTS) | Audio generation for spoken responses                       |
| Let's Encrypt                | SSL certificate management                                  |
| GitHub                       | Source code version control                                 |
| DigitalOcean                 | Cloud hosting infrastructure                                |

### Design Principles

- External services should be loosely coupled to the application.
- Service failures should be handled gracefully whenever possible.
- API credentials must be managed securely using environment variables.
- External dependencies should be documented and periodically reviewed.

---

## Future Architecture

### Vision

The OpenVoz architecture is designed to evolve incrementally while maintaining simplicity, reliability, and maintainability. Future enhancements should improve scalability, security, performance, and AI capabilities without disrupting the core system architecture.

### Planned Enhancements

#### Infrastructure

- Containerized deployment using Docker.
- Automated CI/CD pipelines with GitHub Actions.
- Improved monitoring and alerting.
- Automated backup and disaster recovery procedures.

#### Application

- Migration to PostgreSQL for production deployments.
- Enhanced user authentication and authorization.
- Improved media management.
- Performance optimization and caching.

#### Artificial Intelligence

- Support for multiple AI providers.
- Configurable AI model selection.
- Improved speaking assessment algorithms.
- Personalized learning recommendations.

#### Scalability

- Horizontal application scaling.
- Cloud object storage for media assets.
- Load balancing for high-availability deployments.
- Support for larger numbers of concurrent users.

### Architectural Principles

Future architectural decisions should:

- Preserve modularity.
- Minimize coupling between system components.
- Maintain backward compatibility whenever practical.
- Prioritize security and reliability.
- Follow the standards defined by the AI Project Framework.
- Be validated through real implementation before becoming framework recommendations.
