#!/usr/bin/env node

/**
 * LearnApp API Integration Test Script
 *
 * Bu script frontend-backend API entegrasyonunu test eder:
 * - Admin kullanıcı yönetimi
 * - Kurs oluşturma ve öğretmen ataması
 * - Öğrenci kayıt ve ilerleme takibi
 * - Tüm kullanıcı rolü workflow'ları
 */

const axios = require("axios");
const colors = require("colors");

// Test configuration
const CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  TEST_TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};

// Test data
const TEST_DATA = {
  admin: {
    email: "system.manager@learnapp-test.com",
    password: "Adm!nT3st$ecur3",
    name: "Robert Johnson",
    role: "ADMIN",
  },
  teacher: {
    email: "instructor.lead@learnapp-test.com",
    password: "T3ach3r$ecur3!",
    name: "Sarah Wilson",
    role: "TEACHER",
  },
  student: {
    email: "learner.user@learnapp-test.com",
    password: "L3arn3r$ecur3!",
    name: "Michael Brown",
    role: "STUDENT",
  },
  parent: {
    email: "guardian.family@learnapp-test.com",
    password: "Par3nt$ecur3!",
    name: "Jennifer Davis",
    role: "PARENT",
  },
  course: {
    title: "Test Course",
    description: "A test course for API integration testing",
  },
  section: {
    title: "Test Section",
    order: 1,
  },
  lesson: {
    title: "Test Lesson",
    content: "This is a test lesson content",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    order: 1,
  },
};

// Global test state
const TEST_STATE = {
  tokens: {},
  users: {},
  courses: {},
  sections: {},
  lessons: {},
  enrollments: {},
};

// Utility functions
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeRequest = async (method, url, data = null, headers = {}) => {
  const config = {
    method,
    url: `${CONFIG.BACKEND_URL}${url}`,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    timeout: CONFIG.TEST_TIMEOUT,
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.log(`Request failed: ${method} ${config.url}`.red);
    console.log(
      `Error: ${JSON.stringify(error.response?.data || error.message)}`.red
    );
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};

const retryRequest = async (requestFn, retries = CONFIG.RETRY_COUNT) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await requestFn();
      if (result.success) return result;

      if (i < retries - 1) {
        console.log(`  Retry ${i + 1}/${retries}...`.yellow);
        await sleep(CONFIG.RETRY_DELAY * (i + 1));
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(CONFIG.RETRY_DELAY * (i + 1));
    }
  }
  throw new Error("Max retries exceeded");
};

const logTest = (message, status = "info") => {
  const timestamp = new Date().toISOString();
  const colors_map = {
    info: "blue",
    success: "green",
    error: "red",
    warning: "yellow",
  };
  console.log(`[${timestamp}] ${message}`[colors_map[status] || "white"]);
};

const logSection = (title) => {
  console.log("\n" + "=".repeat(60).cyan);
  console.log(`  ${title}`.cyan.bold);
  console.log("=".repeat(60).cyan);
};

// Test functions
const testHealthCheck = async () => {
  logSection("Health Check Tests");

  logTest("Testing backend health endpoint...");
  const healthResult = await makeRequest("GET", "/health");

  if (healthResult.success) {
    logTest("✓ Backend health check passed", "success");
    logTest(`  Status: ${healthResult.status}`, "info");
    logTest(`  Message: ${healthResult.data.message}`, "info");
  } else {
    logTest("✗ Backend health check failed", "error");
    logTest(`  Error: ${JSON.stringify(healthResult.error)}`, "error");
    throw new Error("Backend health check failed");
  }

  logTest("Testing API info endpoint...");
  const apiResult = await makeRequest("GET", "/api");

  if (apiResult.success) {
    logTest("✓ API info endpoint passed", "success");
    logTest(
      `  Available endpoints: ${Object.keys(apiResult.data.endpoints).join(
        ", "
      )}`,
      "info"
    );
  } else {
    logTest("✗ API info endpoint failed", "error");
    throw new Error("API info endpoint failed");
  }
};

const testUserRegistration = async () => {
  logSection("User Registration Tests");

  const users = ["admin", "teacher", "student", "parent"];

  for (const userType of users) {
    logTest(`Registering ${userType}...`);

    const userData = TEST_DATA[userType];
    const result = await makeRequest("POST", "/api/auth/register", userData);

    if (result.success) {
      logTest(`✓ ${userType} registration successful`, "success");

      // Debug: Log the response structure
      console.log(
        "Registration response:",
        JSON.stringify(result.data, null, 2)
      );

      // Handle different response structures
      const user = result.data.user || result.data.data?.user;
      const accessToken =
        result.data.accessToken || result.data.data?.accessToken;
      const refreshToken =
        result.data.refreshToken || result.data.data?.refreshToken;

      if (user && accessToken && refreshToken) {
        TEST_STATE.users[userType] = user;
        TEST_STATE.tokens[userType] = {
          accessToken,
          refreshToken,
        };
        logTest(`  User ID: ${user.id}`, "info");
      } else {
        logTest(`  Warning: Incomplete response data`, "warning");
        console.log("Available data:", Object.keys(result.data));
      }
    } else {
      // Debug: Log error structure
      console.log(
        "Registration error structure:",
        JSON.stringify(result.error, null, 2)
      );
      console.log("Status:", result.status);

      // If user already exists, try to login
      if (
        (result.status === 400 || result.status === 409) &&
        (result.error?.error?.message?.includes("already exists") ||
          result.error?.message?.includes("already exists") ||
          result.error?.error?.code === "EMAIL_ALREADY_EXISTS" ||
          result.error?.code === "EMAIL_ALREADY_EXISTS")
      ) {
        logTest(`  ${userType} already exists, attempting login...`, "warning");

        const loginResult = await makeRequest("POST", "/api/auth/login", {
          email: userData.email,
          password: userData.password,
        });

        if (loginResult.success) {
          logTest(`✓ ${userType} login successful`, "success");

          // Debug: Log the login response structure
          console.log(
            "Login response:",
            JSON.stringify(loginResult.data, null, 2)
          );

          // Handle different response structures
          const user = loginResult.data.user || loginResult.data.data?.user;
          const accessToken =
            loginResult.data.accessToken || loginResult.data.data?.accessToken;
          const refreshToken =
            loginResult.data.refreshToken ||
            loginResult.data.data?.refreshToken;

          if (user && accessToken && refreshToken) {
            TEST_STATE.users[userType] = user;
            TEST_STATE.tokens[userType] = {
              accessToken,
              refreshToken,
            };
            logTest(`  User ID: ${user.id}`, "info");
          } else {
            logTest(`  Warning: Incomplete login response data`, "warning");
            console.log("Available login data:", Object.keys(loginResult.data));
          }
        } else {
          logTest(`✗ ${userType} login failed`, "error");
          throw new Error(
            `Failed to login ${userType}: ${JSON.stringify(loginResult.error)}`
          );
        }
      } else {
        logTest(`✗ ${userType} registration failed`, "error");
        logTest(`  Error: ${JSON.stringify(result.error)}`, "error");
        throw new Error(`Failed to register ${userType}`);
      }
    }
  }
};

const testUserAuthentication = async () => {
  logSection("User Authentication Tests");

  const users = ["admin", "teacher", "student", "parent"];

  for (const userType of users) {
    logTest(`Testing ${userType} authentication...`);

    const token = TEST_STATE.tokens[userType]?.accessToken;
    if (!token) {
      logTest(`✗ No token found for ${userType}`, "error");
      continue;
    }

    const result = await makeRequest("GET", "/api/auth/me", null, {
      Authorization: `Bearer ${token}`,
    });

    if (result.success) {
      logTest(`✓ ${userType} authentication successful`, "success");
      logTest(`  User: ${result.data?.name} (${result.data?.role})`, "info");
    } else {
      logTest(`✗ ${userType} authentication failed`, "error");
      logTest(`  Error: ${JSON.stringify(result.error)}`, "error");
    }
  }
};

const testAdminUserManagement = async () => {
  logSection("Admin User Management Tests");

  const adminToken = TEST_STATE.tokens.admin?.accessToken;
  if (!adminToken) {
    logTest("✗ No admin token available", "error");
    return;
  }

  // Test getting all users
  logTest("Testing admin get all users...");
  const usersResult = await makeRequest("GET", "/api/users", null, {
    Authorization: `Bearer ${adminToken}`,
  });

  if (usersResult.success) {
    logTest("✓ Admin can fetch all users", "success");
    logTest(`  Found ${usersResult.data?.length || 0} users`, "info");
  } else {
    logTest("✗ Admin failed to fetch users", "error");
    logTest(`  Error: ${JSON.stringify(usersResult.error)}`, "error");
  }

  // Test getting specific user
  const teacherId = TEST_STATE.users.teacher?.id;
  if (teacherId) {
    logTest("Testing admin get specific user...");
    const userResult = await makeRequest(
      "GET",
      `/api/users/${teacherId}`,
      null,
      {
        Authorization: `Bearer ${adminToken}`,
      }
    );

    if (userResult.success) {
      logTest("✓ Admin can fetch specific user", "success");
      logTest(`  User: ${userResult.data?.name}`, "info");
    } else {
      logTest("✗ Admin failed to fetch specific user", "error");
      logTest(`  Error: ${JSON.stringify(userResult.error)}`, "error");
    }
  }
};

const testCourseManagement = async () => {
  logSection("Course Management Tests");

  const adminToken = TEST_STATE.tokens.admin?.accessToken;
  const teacherId = TEST_STATE.users.teacher?.id;

  if (!adminToken || !teacherId) {
    logTest("✗ Missing admin token or teacher ID", "error");
    return;
  }

  // Test course creation
  logTest("Testing course creation...");
  const courseResult = await makeRequest(
    "POST",
    "/api/courses",
    TEST_DATA.course,
    {
      Authorization: `Bearer ${adminToken}`,
    }
  );

  if (courseResult.success) {
    logTest("✓ Course creation successful", "success");
    TEST_STATE.courses.main = courseResult.data;
    logTest(`  Course ID: ${courseResult.data?.id}`, "info");
    logTest(`  Course Title: ${courseResult.data?.title}`, "info");
  } else {
    logTest("✗ Course creation failed", "error");
    logTest(`  Error: ${JSON.stringify(courseResult.error)}`, "error");
    return;
  }

  const courseId = TEST_STATE.courses.main.id;

  // Test teacher assignment
  logTest("Testing teacher assignment to course...");
  const assignResult = await makeRequest(
    "POST",
    "/api/courses/assign-teacher",
    {
      courseId,
      teacherId,
    },
    {
      Authorization: `Bearer ${adminToken}`,
    }
  );

  if (assignResult.success) {
    logTest("✓ Teacher assignment successful", "success");
    TEST_STATE.courses.main = assignResult.data;
  } else {
    logTest("✗ Teacher assignment failed", "error");
    logTest(`  Error: ${JSON.stringify(assignResult.error)}`, "error");
  }

  // Test section creation
  logTest("Testing section creation...");
  const sectionResult = await makeRequest(
    "POST",
    "/api/courses/sections",
    {
      ...TEST_DATA.section,
      courseId,
    },
    {
      Authorization: `Bearer ${adminToken}`,
    }
  );

  if (sectionResult.success) {
    logTest("✓ Section creation successful", "success");
    TEST_STATE.sections.main = sectionResult.data;
    logTest(`  Section ID: ${sectionResult.data.id}`, "info");
  } else {
    logTest("✗ Section creation failed", "error");
    logTest(`  Error: ${JSON.stringify(sectionResult.error)}`, "error");
    return;
  }

  // Test lesson creation
  logTest("Testing lesson creation...");
  const lessonResult = await makeRequest(
    "POST",
    "/api/courses/lessons",
    {
      ...TEST_DATA.lesson,
      sectionId: TEST_STATE.sections.main.id,
    },
    {
      Authorization: `Bearer ${adminToken}`,
    }
  );

  if (lessonResult.success) {
    logTest("✓ Lesson creation successful", "success");
    TEST_STATE.lessons.main = lessonResult.data;
    logTest(`  Lesson ID: ${lessonResult.data.id}`, "info");
  } else {
    logTest("✗ Lesson creation failed", "error");
    logTest(`  Error: ${JSON.stringify(lessonResult.error)}`, "error");
  }
};

const testTeacherWorkflow = async () => {
  logSection("Teacher Workflow Tests");

  const teacherToken = TEST_STATE.tokens.teacher?.accessToken;
  if (!teacherToken) {
    logTest("✗ No teacher token available", "error");
    return;
  }

  // Test getting teacher courses
  logTest("Testing teacher get assigned courses...");
  const coursesResult = await makeRequest("GET", "/api/courses/teacher", null, {
    Authorization: `Bearer ${teacherToken}`,
  });

  if (coursesResult.success) {
    logTest("✓ Teacher can fetch assigned courses", "success");
    logTest(
      `  Found ${coursesResult.data?.length || 0} assigned courses`,
      "info"
    );
  } else {
    logTest("✗ Teacher failed to fetch courses", "error");
    logTest(`  Error: ${JSON.stringify(coursesResult.error)}`, "error");
  }

  // Test course detail access
  const courseId = TEST_STATE.courses.main?.id;
  if (courseId) {
    logTest("Testing teacher course detail access...");
    const courseResult = await makeRequest(
      "GET",
      `/api/courses/${courseId}`,
      null,
      {
        Authorization: `Bearer ${teacherToken}`,
      }
    );

    if (courseResult.success) {
      logTest("✓ Teacher can access course details", "success");
      logTest(`  Course: ${courseResult.data.title}`, "info");
    } else {
      logTest("✗ Teacher failed to access course details", "error");
      logTest(`  Error: ${JSON.stringify(courseResult.error)}`, "error");
    }
  }
};

const testStudentWorkflow = async () => {
  logSection("Student Workflow Tests");

  const studentToken = TEST_STATE.tokens.student?.accessToken;
  const studentId = TEST_STATE.users.student?.id;
  const courseId = TEST_STATE.courses.main?.id;

  if (!studentToken || !studentId || !courseId) {
    logTest("✗ Missing student token, student ID, or course ID", "error");
    return;
  }

  // Test course enrollment
  logTest("Testing student course enrollment...");
  const enrollResult = await makeRequest(
    "POST",
    "/api/courses/enroll",
    {
      courseId,
    },
    {
      Authorization: `Bearer ${studentToken}`,
    }
  );

  if (enrollResult.success) {
    logTest("✓ Student enrollment successful", "success");
    TEST_STATE.enrollments.main = enrollResult.data;
    logTest(`  Enrollment ID: ${enrollResult.data.id}`, "info");
  } else {
    logTest("✗ Student enrollment failed", "error");
    logTest(`  Error: ${JSON.stringify(enrollResult.error)}`, "error");
  }

  // Test getting student enrollments
  logTest("Testing student get enrollments...");
  const enrollmentsResult = await makeRequest(
    "GET",
    `/api/courses/student/${studentId}/enrollments`,
    null,
    {
      Authorization: `Bearer ${studentToken}`,
    }
  );

  if (enrollmentsResult.success) {
    logTest("✓ Student can fetch enrollments", "success");
    logTest(`  Found ${enrollmentsResult.data.length} enrollments`, "info");
  } else {
    logTest("✗ Student failed to fetch enrollments", "error");
    logTest(`  Error: ${JSON.stringify(enrollmentsResult.error)}`, "error");
  }

  // Test lesson completion
  const lessonId = TEST_STATE.lessons.main?.id;
  if (lessonId) {
    logTest("Testing lesson completion...");
    const completeResult = await makeRequest(
      "POST",
      `/api/courses/lessons/${lessonId}/complete`,
      null,
      {
        Authorization: `Bearer ${studentToken}`,
      }
    );

    if (completeResult.success) {
      logTest("✓ Lesson completion successful", "success");
    } else {
      logTest("✗ Lesson completion failed", "error");
      logTest(`  Error: ${JSON.stringify(completeResult.error)}`, "error");
    }
  }

  // Test progress tracking
  logTest("Testing student progress tracking...");
  const progressResult = await makeRequest(
    "GET",
    `/api/courses/${courseId}/progress/${studentId}`,
    null,
    {
      Authorization: `Bearer ${studentToken}`,
    }
  );

  if (progressResult.success) {
    logTest("✓ Student progress tracking successful", "success");
    logTest(
      `  Completion: ${progressResult.data.completionPercentage}%`,
      "info"
    );
    logTest(
      `  Completed lessons: ${progressResult.data.completedLessons}/${progressResult.data.totalLessons}`,
      "info"
    );
  } else {
    logTest("✗ Student progress tracking failed", "error");
    logTest(`  Error: ${JSON.stringify(progressResult.error)}`, "error");
  }
};

const testParentWorkflow = async () => {
  logSection("Parent Workflow Tests");

  const parentToken = TEST_STATE.tokens.parent?.accessToken;
  const studentId = TEST_STATE.users.student?.id;
  const courseId = TEST_STATE.courses.main?.id;

  if (!parentToken || !studentId || !courseId) {
    logTest("✗ Missing parent token, student ID, or course ID", "error");
    return;
  }

  // Test viewing student progress (as parent)
  logTest("Testing parent view student progress...");
  const progressResult = await makeRequest(
    "GET",
    `/api/courses/${courseId}/progress/${studentId}`,
    null,
    {
      Authorization: `Bearer ${parentToken}`,
    }
  );

  if (progressResult.success) {
    logTest("✓ Parent can view student progress", "success");
    logTest(
      `  Student completion: ${progressResult.data.completionPercentage}%`,
      "info"
    );
  } else {
    logTest("✗ Parent failed to view student progress", "error");
    logTest(`  Error: ${JSON.stringify(progressResult.error)}`, "error");
  }

  // Test viewing student enrollments
  logTest("Testing parent view student enrollments...");
  const enrollmentsResult = await makeRequest(
    "GET",
    `/api/courses/student/${studentId}/enrollments`,
    null,
    {
      Authorization: `Bearer ${parentToken}`,
    }
  );

  if (enrollmentsResult.success) {
    logTest("✓ Parent can view student enrollments", "success");
    logTest(
      `  Student has ${enrollmentsResult.data.length} enrollments`,
      "info"
    );
  } else {
    logTest("✗ Parent failed to view student enrollments", "error");
    logTest(`  Error: ${JSON.stringify(enrollmentsResult.error)}`, "error");
  }
};

const testErrorHandling = async () => {
  logSection("Error Handling Tests");

  // Test unauthorized access
  logTest("Testing unauthorized access...");
  const unauthorizedResult = await makeRequest("GET", "/api/users");

  if (!unauthorizedResult.success && unauthorizedResult.status === 401) {
    logTest("✓ Unauthorized access properly rejected", "success");
  } else {
    logTest("✗ Unauthorized access not properly handled", "error");
  }

  // Test invalid token
  logTest("Testing invalid token...");
  const invalidTokenResult = await makeRequest("GET", "/api/auth/me", null, {
    Authorization: "Bearer invalid-token",
  });

  if (!invalidTokenResult.success && invalidTokenResult.status === 401) {
    logTest("✓ Invalid token properly rejected", "success");
  } else {
    logTest("✗ Invalid token not properly handled", "error");
  }

  // Test non-existent endpoint
  logTest("Testing non-existent endpoint...");
  const notFoundResult = await makeRequest("GET", "/api/non-existent");

  if (!notFoundResult.success && notFoundResult.status === 404) {
    logTest("✓ Non-existent endpoint properly handled", "success");
  } else {
    logTest("✗ Non-existent endpoint not properly handled", "error");
  }
};

const generateTestReport = () => {
  logSection("Test Summary Report");

  console.log("Test Configuration:".bold);
  console.log(`  Backend URL: ${CONFIG.BACKEND_URL}`);
  console.log(`  Frontend URL: ${CONFIG.FRONTEND_URL}`);
  console.log(`  Test Timeout: ${CONFIG.TEST_TIMEOUT}ms`);
  console.log(`  Retry Count: ${CONFIG.RETRY_COUNT}`);

  console.log("\nTest Data Created:".bold);
  console.log(`  Users: ${Object.keys(TEST_STATE.users).length}`);
  console.log(`  Courses: ${Object.keys(TEST_STATE.courses).length}`);
  console.log(`  Sections: ${Object.keys(TEST_STATE.sections).length}`);
  console.log(`  Lessons: ${Object.keys(TEST_STATE.lessons).length}`);
  console.log(`  Enrollments: ${Object.keys(TEST_STATE.enrollments).length}`);

  console.log("\nCreated Resources:".bold);
  Object.entries(TEST_STATE.users).forEach(([role, user]) => {
    console.log(`  ${role}: ${user.name} (${user.id})`);
  });

  if (TEST_STATE.courses.main) {
    console.log(
      `  Course: ${TEST_STATE.courses.main.title} (${TEST_STATE.courses.main.id})`
    );
  }

  console.log("\nRecommendations:".bold);
  console.log("  - Review any failed tests above");
  console.log("  - Check backend logs for detailed error information");
  console.log("  - Verify database connections and migrations");
  console.log("  - Ensure all required environment variables are set");
  console.log("  - Test frontend components with these API endpoints");
};

// Main test runner
const runTests = async () => {
  console.log("LearnApp API Integration Test Suite".rainbow.bold);
  console.log("=====================================".rainbow);

  const startTime = Date.now();

  try {
    await testHealthCheck();
    await testUserRegistration();
    await testUserAuthentication();
    await testAdminUserManagement();
    await testCourseManagement();
    await testTeacherWorkflow();
    await testStudentWorkflow();
    await testParentWorkflow();
    await testErrorHandling();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    logTest(
      `\n🎉 All tests completed successfully in ${duration}s!`,
      "success"
    );
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    logTest(`\n💥 Tests failed after ${duration}s`, "error");
    logTest(`Error: ${error.message}`, "error");

    if (error.stack) {
      console.log("\nStack trace:".red);
      console.log(error.stack.red);
    }

    process.exit(1);
  } finally {
    generateTestReport();
  }
};

// Handle process signals
process.on("SIGINT", () => {
  console.log("\n\nTest interrupted by user".yellow);
  generateTestReport();
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testHealthCheck,
  testUserRegistration,
  testUserAuthentication,
  testAdminUserManagement,
  testCourseManagement,
  testTeacherWorkflow,
  testStudentWorkflow,
  testParentWorkflow,
  testErrorHandling,
  CONFIG,
  TEST_DATA,
  TEST_STATE,
};
