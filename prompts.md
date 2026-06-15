We need to add a new content management to the app for admins.

- Similar to the existing stories management, but for admins - reuse everything
- fetch the data from "career_cluster_resources" collection
- user should be able to filter by "cluster_name"
- user should be able to filter by "status"
- user should be able to filter by "types"
- user should be able to filter by "created_at"
- user should be able to filter by "updated_at"


- all links should have a button to preview it using the existing webview component
- "types" should be a dropdown with the following options:
    - challenge
    - story
    - good_reads
    - video
    - podcast
    - article

This feature should work on both web and mobile.
Add entry point for the feature in the admin menu.
access to the feature should be restricted to admins and editors only (isAdmin and isEditor from the user data)

Read the rules and documentation before you start.

I am looking the the way four features are implemented in the app:
- stories management
- challenges management
- dream careers management
- content management

And there are many inconsistencies in the way they are implemented. and I want to fix it and make rules for any new content management feature that will be added in the future.

I want to use stories management as a template for all other content management features. I want to make reusable template for any new content management and implement it.

I want to cover following aspects:

    - list of all content
        - search
        - filter
        - sort
        - pagination (infinite scroll)
    - add new content button 
    - edit content button
    - delete content button

    On the detail screen should accommodate following:
        - header
        - content dynamic content featched from firestore. This can be custom made.


    Edit screen should accommodate following:
        - header
        - content
        - footer with a primary action button to save the changes


On the web, the feature should be implemented in the same way as the stories management in a two panel layout.

- Read the rules and documentation before you start.
- create a reusable template for the feature
- Implement the template for all 4 content management features.
- Create a documentation cursor can use to implement any new content management feature in the future.
--------------------------------

I want to build a new content management feature on the admin side.

We have 4 categories of content:
- stories
- challenges
- dream_careers
- career_cluster_resources



--------------------------------


I want to build the content generation as firebase functions. The function should first fetch career_cluster_resources with status "published" from firestore, use that source to generate the following content:

- stories, 
- good reads, 
- challenges  

based on the types field in the career_cluster_resources document. 

Refer to challenges/defense-readiness-quiz.json for challenge strusture
Refer to good_reads/structure.json for good read structure
Refer to stories/story_arts_creative_fields_4550.json for story structure

After generating the content, 

- save them in respective collections in firestore with status "draft"
- Update the career_cluster_resources document with a new status "generated".

I want the generation function to be re usable and as a separate function. Keep the firebase functions well organized and easy to maintain.

Check the existing py scripts to get the right prompts. I walso want to make sure the prompts are saved in a separate text file like xtara-firebase/functions/prompts/career_prompt_rag.txt




________________________________________________________

I want to build a new progressive profiling system for students. I want to build a subject wise performance tracker. based on the carriculum the user will have to input marks by sliding a percentage slider.

Step 1:

Check if the user already has selected the subjects. If yes go to step 2.

Else the subject selector should ask the user to select the subjects they are studying with optional other subjects field where the user can enter the subject manually. Like aregional language, etc. The curriculum based subjects are available as a remote config file called carrculums.json. The grade and board are available in the assessment data.

After completing the configuration we need to save the data in the user document under subjectsLearning field in the user document, 

"subjectsLearning": [
    "english",
    "math",
    "science",
    "socialStudies"
],

Step 2:


After the user has selected the subjects, we need to add a new field to the user document. Also build a UI to input the marks for each subject.

"exam_performance": {
    "exam_performance_id": {
    "english": 75,
    "math": 80,
    "science": 85,
    "socialStudies": 90,
    "total": 330,
    "timestamp": "2025-07-21T07:00:00Z"
    }
},


But when resubmitting the form, we need to update the exam_performance field, but also add it a subcollection called "exam_performance" with a new id for comparing the previous and new values.



{
    [
        "india":{
            "name": "India",
            "telephone_code": "+91",
            "currency": "INR",
            "currency_symbol": "₹",
            "currency_code": "INR",
            "currency_symbol": "₹",
            "states": [
                {
                    "name": "Kerala",
                    "languages": [
                        "Malayalam",
                        "English"
                    ],
                    "districts": [
                        "Ernakulam",
                        "Kollam",
                        "Kottayam",
                        "Kozhikode",
                        "Malappuram",
                        "Palakkad",
                        "Pathanamthitta",
                        "Thiruvananthapuram",
                        "Thrissur",
                        "Wayanad",
                        "Idukki",
                        "Kannur",
                        "Kasaragod",
                        "Kozhikode",
                        "Malappuram",
                        "Palakkad",
                        "Pathanamthitta",
                        "Thiruvananthapuram",
                        "Thrissur",
                        "Wayanad",
                    ],
                },
                {
                    "name": "Tamil Nadu",
                    "languages": [
                        "Tamil",
                        "English"
                    ],
                }
        }
    ]
}




_____________________________________________________________




I want to build a framework to calculate and display a user's progress towards achieving their career goals.

As of today, this should be calculated based on the following data:

 - Number of challenges completed and points earned
 - Number of good reads completed
 - Number of stories watched 

The users should have weekly goals achieved.

We should also have lifetime goals achieved.

The goals will be defined by the admin as a remote configuration.

Read the rules and Start with building the framework to calculate the progress in a standard format. This data should be saved under the users profile as a subcollection called "career_goals".

After this impmentation is successful, we should focus on the follwing:

- we should also have a leaderboard to display the top 10 users based on the points earned.

- I also want to build a steaks framework with bonus points for the users who achieve their goals. For Eg read 5 stories, take 5 challenges, take 5 good reads, etc in one week and get 10% bonus points.

- The user should be able to see their progress towards achieving their goals.



_____________________________________________________________

 I also want to make an extension  to the contentCurator function. Let's call it curateContentFromUrl.

 We should allow the user to input a url and the function will fetch the content from the url, categorize it based on cluster_mappings and save it in the firestore collection "career_cluster_resources" following the current structure. The user can optionally enter a career cluster name, or any other fields from cluster_mappings which will be used to categorize the content.




 







_____________________________________________________________

No The mapping is not correct. Follow this.

Pick a dream career, read the title, and ask the LLM to get what UG, PG, Diploma courses should a student study to become a eg: "Agricultural Scientist". Output a list of 10 relevant courses with ranking.

And for each course, ask the LLM to get find the courses that are available in the database and are relevant to the courses LLm recommended.

add the courses and colleges to the dream_career document following the structure below:

"courses_mapping": {
    "mappedAt": "2025-01-27T00:00:00Z",
    "total_courses_recommended": 5,
    "total_courses_with_colleges": 5,
    "courses": [
        {
            "course_name": "B.Tech Computer Science",
            "colleges":[
                {
                    "name": "IIT Delhi",
                    "state": "Delhi",
                    "city": "Delhi"
                }
            ],
            "course_type": "UG",
            "relevance_score": 9.5,
            "reasoning": "Essential foundation for software development"
        }
    ]
}

if the course is not available in the database add it a new files :

"unmapped_courses": [
    {
        "course_name": "B.Tech Computer Science",
        "course_type": "UG",
        "relevance_score": 9.5,
        "reasoning": "Essential foundation for software development"
    }
]

After appending this data, save the document in the /Users/pretheesh/Projects/project-xtara/career-ai/dream_career_refiner/dream_careers_mapped folder.



_____________________________________________________________



Based on the updated structure of the career_path.json (/Users/pretheesh/Projects/project-xtara/data_models/career_path.json) we need to upldate the career path screen in the app.


Let's keep the current header, but in the _buildContentSections(careerPath), we need to have 3 major cards summariziing the learn, connect and grow sections beautifully. We have colorful svg icons added to the project (/Users/pretheesh/Projects/project-xtara/career/assets/illustrations/multicolor). We can use 3 distinct color themes for each section.


Each section wil have entry points to a dedicated learn, connect and grow page where we will display the relevent currently implemented content blocks as they are. No changes required.

After this implementation is successful, we need to update the recommended careers screen to display colleges based on the user's location.









Here's how the college search should work.

Whne the page loads get the count of all colleges and state and city wise calculations. The count should be independent of the list. 

Afte that get and display the colleges in the list with scroll to load more pagination. 














I want to create a github action script to do the following:


-   When a new document is created in /Users/pretheesh/Projects/project-xtara/xtara/public/contentAPI/challenges a script should process the document to create a new challenge following the structure in /Users/pretheesh/Projects/project-xtara/data_models/challenge.json and push it to the firestore collection "challenges" with status "draft".


I want 2 functions in firebase functions:

1 - Upload challenges markdown files to GS via a post request to the function /uploadChallengesToGS
2 - Trigger challenges processing from the GS file and upload it to the firestore collection "challenges" with status "draft". /processChallengesFromGS
    Here's how the processing should work":
    - get unprocessed documents from the GS folder
    - use an LLM (vertext ai) to process the document to create a new challenge following the structure in /Users/pretheesh/Projects/project-xtara/data_models/challenge.json and push it to the firestore collection "challenges" with status "draft". 







We need to re-create few functions. Refer to the backup directory beofre creating new ones.


We already have a curatecontent function which adds data to the firestore collection "content_repo" from various sources follwing this data structure: {   
    "clusters": [],
    "createdAt": "2025-10-06T10:52:08.000Z",
    "description": "",
    "goldenSource": false,
    "group": "softskills",
    "inspiration": false,
    "isDraft": true,
    "isPublished": false,
    "softskills": [
        "time_management"
    ],
    "source": "chrome_extension",
    "type": "good_read",
    "url": "https://corporatefinanceinstitute.com/resources/management/time-management-list-tips/",
    "urls": [
        "https://corporatefinanceinstitute.com/resources/management/time-management-list-tips/"
    ]
}

When a new document is created we need to trigger a function called "onContentCreatedInRepo" which will assign one of the following functions to process the document based on the type field:

If the type is "good_read", "processGoodReadsFromRepo" function will be triggered.
If the type is "story", "processStoriesFromRepo" function will be triggered.
If the type is "challenge", "processChallengesFromRepo" function will be triggered.
If the type is "sparks", "processSparksFromRepo" function will be triggered.

if the urls field is empty use the url field to generate the content. If the urls field is not empty, the functions should use all the urls to fetch the content via LLM.

Specs for the functions:

- All functions must use vertext ai to generate the content.
- After processing, the output must be saved to the respective collections with status "draft".
- After processing, the content_repo document must be updated with the status "processed".
- Each function must have prompts as text files for prompts.
- Data models can be referenced from the data_models folder.

- processGoodReadsFromRepo:
    - This function should use vertext ai to generate a good read following the structure in data_models/good_reads.json
- processStoriesFromRepo:
    - This function should use vertext ai to generate a story following the structure in data_models/stories.json
- processChallengesFromRepo:
    - This function should use vertext ai to generate an md file follwing /Users/pretheesh/Projects/project-xtara/xtara/public/contentAPI/challenges/ai-career-guidance_2025-01-20.md structure and store it in GCS bucket.
    - After generating the md file, the function should trigger the /processChallengesFromGS function to process the md file and save it to the firestore collection "challenges" with status "draft".
- processSparksFromRepo:
    - This function should use vertext ai to generate a sparks following the structure in data_models/sparks.json

- contentReviewAgent:
    - when a new document is created in respective output collections, this function should be triggered to review the document and update the document with the status "reviewed". We should have a prompt to set the criterea like cultureal sensitivty of the content, vailidty of urls etc.



--rename this onContentRepoCreated to onContentCreatedInRepo. Data Models: use existing ones,  GCS Bucket: check the environment file. Vertex AI Model Gemini 2.5 pro, or flash whichever is cost effective and has good quality. Prompt Files yes in the functions folder. add processed, and reviewed fields.. create another status: failed. backups are here: /Users/pretheesh/Projects/project-xtara/xtara-firebase/backup




We need to fix the RAG output here's what we need to implement:


The output MUST be in the following structure:
/Users/pretheesh/Projects/project-xtara/data_models/career_path.json

Then the generateCareerPathRAG function is called do the following:

Using the matching service find the top 5 related careers from the dream_careers collection. DO NOT manipluate the output.

set the top rated career as the primary career (primaryCareer).
keep the rest of the careers as related careers (relatedCareers).

Send the only the primaryCareer to the LLM for refinement. Get the output in a simple json format based on the text prompt follwing this strucyure: /Users/pretheesh/Projects/project-xtara/data_models/career_path_AI_call_only.json

After the LLM output is received, create the career_path document combining the primaryCareer and relatedCareers and the LLM output. Add the rag details in the meta metadata field.






