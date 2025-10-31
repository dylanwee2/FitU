# FitU

Welcome to the GitHub repository for FitU! Whether you're looking to start your fitness journey, or an avid fitness enthusiast, FitU is here to supercharge your productivity and health. 

## Project Overview

Did you know that 61% of Singaporean students feel burnt out from their packed and hectic schedules? Most students feel that they do not have the bandwidth to balance studies, health, and fitness. However, 
FitU is here to solve that. Packed with thoughtful features and an intuitive user interface, FitU's design ensures that you have the best user experience as you record, search and analyse your way to a more healthy life.

## Deployed Link
insert the link here

## Installation

Install FitU with npm <br>

1. Open a terminal and run the following command:
```bash
  cd Backend
  npm install
  npm run start
```
2. Open another terminal and run the following command:
```bash
  cd Frontend
  npm install
  npm run dev
```
3. Start the website on a browser using local host


    
## Key Features

- **Calendar**: Allows users to immport ICS files so sync their calendar up with other platforms like Google Calendar and Apple Calendar. Users can also add new events, which will then be displayed on the calendar in the home page.
- **Workout Browser**: Enables users search for specific workkouts using keywords such as muscle groups and equipment used. Clicking into the workout shows you detailed instructions to perform the exercise, along with the targeted muscle groups and an animated instructional video.
- **Workout Sets**: Upon finding suitable exercises, add them to the Workout Cart to save a set of exercises which you can refer to next time. Modify the sets, weights, and reps to get detailed information about your workout, including the muscle groups targeted, estimated duration, and number of exercises.
- **Workout Vault**: Not sure what exercises to do? Look to the Workout Vault, a community driven database for all tried and true workouts. Comment on, save, and edit workouts from others, and upload your own workouts to help others on their fitness journey.
- **Recipe Browser**: Search for recipes for nutritious meals by searching for the ingredient or dish name.
- **Virtual Gym**: Explore various gym equipment and their functionalities in a 3D space. Choose to focus on the equipment, or look around the gym for other pieces of equipment. Perfect for new gym-goers or those looking to try new exercises. 
- **Macros and fitness Tracking**: Enables users to track the calories from their meals, along with workout streaks and saved workouts in the form of graphs and tables. All of these can be viewed and edited in the profile page and the home page.

## Solution Architecture

![Solution Architecture](Frontend/src/assets/SolutionArchitecture.png)

### Frontend

<img src="Frontend/src/assets/FrontendStack.png" alt="Frontend" width="400"/>

### Backend

<img src="Frontend/src/assets/BackendStack.png" alt="Backend" width="400"/>

## APIs

- **Google Cloud Storage**: Cloud Storage of Images
- **Open Trivia Database**: Provides database of trivia questions
- **Twilio**: Supports real-time chat and notifications.
- **Firebase Auth**: User authentication for creating accounts and logging in
