# OpenVoz Deployment Guide

## Purpose

This document defines the complete deployment process for OpenVoz, from local development to a fully operational production environment.

It serves as the authoritative deployment reference for the OpenVoz project and complements the AI Project Framework deployment methodology.

---

# System Overview

OpenVoz is a production AI-powered web application built with Django and deployed on a Linux server using Gunicorn and Nginx. The application integrates with the OpenAI API for AI-powered language learning features and uses HTTPS for secure communication.

---

# Infrastructure

## Hosting

### Purpose

The hosting environment provides the production infrastructure required to deploy, execute, and maintain the OpenVoz platform. It delivers the computing resources, networking, and operating system upon which all application services run.

### Cloud Provider

**DigitalOcean**

OpenVoz is deployed on a DigitalOcean Droplet, which provides a reliable and scalable virtual private server (VPS) for hosting the production environment.

### Hosting Environment

- **Environment:** Production
- **Deployment Model:** Virtual Private Server (VPS)
- **Server Type:** DigitalOcean Droplet

### Public IP Address

```
167.71.26.75
```

> **Note:** The public IP address may change if the infrastructure is migrated or rebuilt. Domain DNS records should always point to the current production server.

### Responsibilities

The hosting environment is responsible for:

- Running the Ubuntu operating system.
- Hosting the Django application.
- Providing network connectivity.
- Supporting HTTPS communication.
- Running Gunicorn and Nginx services.
- Storing application files and media.
- Providing access for remote administration via SSH.

### Related Components

The hosting environment supports:

- Ubuntu Server
- Nginx
- Gunicorn
- Django
- OpenAI API connectivity
- SSL Certificates
- Static and Media File Storage

## Operating System

### Purpose

The operating system provides the production runtime environment for OpenVoz and supports the web server, application server, security tooling, and administrative processes required to operate the platform.

### Operating System

**Ubuntu Server**

OpenVoz runs on Ubuntu Server within the production DigitalOcean Droplet.

> **TODO:** Verify and document the exact Ubuntu release installed on the production server.

### Runtime Environment

The Django application runs with Python and is served by Gunicorn behind Nginx.

> **TODO:** Verify and document the Python version used by the production application environment.

### Installed Services

The production environment includes:

- Nginx
- Gunicorn
- Let's Encrypt certificate management through Certbot

> **TODO:** Verify the installed package versions and confirm the complete package and service inventory on the production server.

### Responsibilities

The operating system is responsible for:

- Providing the runtime environment for Django and Gunicorn.
- Running Nginx as the public web server and reverse proxy.
- Supporting HTTPS certificate management through Certbot.
- Managing application files, static files, and media files.
- Providing process management and remote administration capabilities.

### Related Components

The operating system supports:

- DigitalOcean Droplet
- Django
- Python
- Gunicorn
- Nginx
- Let's Encrypt (Certbot)
- Static and Media File Storage

## Domain

- Primary Domain
- Secondary Domain
- Domain Registrar

## DNS

- DNS Provider
- A Records
- CNAME Records
- DNS Verification Procedure

## SSL Certificates

- Certificate Provider
- Renewal Method
- Verification Commands

---

# Technology Stack

## Backend

- Django
- Python
- Gunicorn

## Web Server

- Nginx

## Database

- PostgreSQL (Production)
  or
- SQLite (Development)

## AI Services

- OpenAI API

## Version Control

- Git
- GitHub

---

# Deployment Workflow

## Phase 1 — Local Development

### Objectives

### Prerequisites

### Commands

### Expected Results

---

## Phase 2 — GitHub

### Objectives

### Commands

### Verification

---

## Phase 3 — Production Server

### Objectives

### Commands

### Verification

---

## Phase 4 — Database

### Migrations

### Verification

---

## Phase 5 — Static Files

### collectstatic

### Verification

---

## Phase 6 — Restart Services

### Gunicorn

### Nginx

### Verification

---

## Phase 7 — Production Validation

### HTTPS

### AI API

### Static Files

### Media Files

### Browser Testing

---

# Environment Variables

## Development

## Production

## Required Variables

---

# Deployment Checklist

- Repository synchronized
- Virtual environment activated
- Dependencies installed
- Database migrated
- Static files collected
- Gunicorn restarted
- Nginx configuration verified
- SSL certificate valid
- DNS verified
- Application accessible
- AI services operational

---

# Rollback Procedure

## When to Roll Back

## Rollback Steps

## Validation

---

# Troubleshooting Guide

## DNS Problems

## SSL Problems

## Nginx Problems

## Gunicorn Problems

## Static Files

## Database

## OpenAI API

---

# Operational Commands

## Git

## Django

## Gunicorn

## Nginx

## Certbot

## Linux

---

# Lessons Learned

Production incidents, deployment improvements, and operational best practices discovered during the lifetime of the project.

---

# References

- AI Project Framework
- Core/10_PRODUCTION_SYSTEMS.md
- Core/11_DEPLOYMENT.md
- Core/12_OPERATIONS.md
- Core/13_MONITORING.md
- Core/14_INCIDENT_RESPONSE.md
