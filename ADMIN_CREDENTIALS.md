# Admin Panel Login Credentials

## Access the Admin Panel
- **URL**: http://localhost:3000/admin.html (when server is running locally)
- **Network URL**: http://192.168.12.87:3000/admin.html (for friends on same network)

## Login Credentials

### Primary Accounts
- **Owner Account**: 
  - Username: `admin`
  - Password: `yukonwildcats2024`
  - Role: Owner (full access)

- **Manager Account**:
  - Username: `manager`
  - Password: `wildcats2024`
  - Role: Admin

### Friend Accounts (configured in .env file)
- **Friend 1**:
  - Username: `friend1`
  - Password: `password123`
  - Role: Admin

- **Friend 2**:
  - Username: `friend2`
  - Password: `password456`
  - Role: Admin

- **Guest Account**:
  - Username: `guest`
  - Password: `guestpass`
  - Role: Admin

## How to Add More Users
1. Edit the `.env` file in the `server` folder
2. Add users to the `ADDITIONAL_ADMINS` line in this format:
   `username:password:role,username2:password2:role`
3. Restart the server

## Troubleshooting
- Make sure the server is running (you should see "Server running on all interfaces at port 3000")
- Check that you're accessing the correct URL
- Ensure your friends are on the same network if using the network URL
- Try refreshing the page if login fails

## Features Available
- View and manage form submissions
- Update website content
- Manage team member information
- Update service icons and logos
- Control site announcements