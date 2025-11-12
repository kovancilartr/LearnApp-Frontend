const axios = require("axios");
const colors = require("colors");

// API Base URL
const API_BASE_URL = "http://localhost:3001/api";

// Test data (matching seed data)
const testData = {
  admin: {
    email: "admin@egitimplatformu.com",
    password: "sifre123",
  },
  teacher: {
    email: "ahmet.ogretmen@egitimplatformu.com",
    password: "sifre123",
  },
  student: {
    email: "elif.ogrenci@egitimplatformu.com",
    password: "sifre123",
  },
};

let authTokens = {};

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(data && { data }),
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// Authentication helper
async function authenticate(role) {
  console.log(`🔐 Authenticating as ${role}...`.yellow);

  const result = await makeRequest("POST", "/auth/login", testData[role]);

  if (result.success && result.data.success) {
    authTokens[role] = result.data.data.accessToken;
    console.log(`✅ ${role} authenticated successfully`.green);
    return true;
  } else {
    console.log(`❌ ${role} authentication failed:`.red, result.error);
    return false;
  }
}

// Test functions
async function testUserServiceEndpoints() {
  console.log("\n📋 Testing UserService Endpoints...".cyan.bold);

  const adminToken = authTokens.admin;
  if (!adminToken) {
    console.log("❌ Admin token not available".red);
    return;
  }

  // Test 1: Get Users (corrected endpoint)
  console.log("\n1. Testing GET /users (getUsers)");
  let result = await makeRequest(
    "GET",
    "/users?page=1&limit=5",
    null,
    adminToken
  );
  if (result.success) {
    console.log("✅ GET /users - SUCCESS".green);
    console.log(`   Found ${result.data.data?.data?.length || 0} users`);
  } else {
    console.log("❌ GET /users - FAILED".red);
    console.log("   Error:", result.error);
  }

  // Test 2: Get Current User Profile (corrected endpoint)
  console.log("\n2. Testing GET /profile/detailed (getCurrentUserProfile)");
  result = await makeRequest("GET", "/profile/detailed", null, adminToken);
  if (result.success) {
    console.log("✅ GET /profile/detailed - SUCCESS".green);
    console.log(`   User: ${result.data.data?.name || "Unknown"}`);
  } else {
    console.log("❌ GET /profile/detailed - FAILED".red);
    console.log("   Error:", result.error);
  }

  // Test 3: Get Students Without Parent (corrected endpoint)
  console.log("\n3. Testing GET /users/students-without-parent");
  result = await makeRequest(
    "GET",
    "/users/students-without-parent",
    null,
    adminToken
  );
  if (result.success) {
    console.log("✅ GET /users/students-without-parent - SUCCESS".green);
    console.log(
      `   Found ${result.data.data?.length || 0} students without parent`
    );
  } else {
    console.log("❌ GET /users/students-without-parent - FAILED".red);
    console.log("   Error:", result.error);
  }

  // Test 4: Get All Parents (corrected endpoint)
  console.log("\n4. Testing GET /users/all-parents");
  result = await makeRequest("GET", "/users/all-parents", null, adminToken);
  if (result.success) {
    console.log("✅ GET /users/all-parents - SUCCESS".green);
    console.log(`   Found ${result.data.data?.length || 0} parents`);
  } else {
    console.log("❌ GET /users/all-parents - FAILED".red);
    console.log("   Error:", result.error);
  }
}

async function testCourseServiceEndpoints() {
  console.log("\n📚 Testing CourseService Endpoints...".cyan.bold);

  const adminToken = authTokens.admin;
  const teacherToken = authTokens.teacher;
  const studentToken = authTokens.student;

  // Test 1: Get Courses
  console.log("\n1. Testing GET /courses (getCourses)");
  let result = await makeRequest(
    "GET",
    "/courses?page=1&limit=5",
    null,
    adminToken
  );
  if (result.success) {
    console.log("✅ GET /courses - SUCCESS".green);
    console.log(`   Found ${result.data.data?.data?.length || 0} courses`);
  } else {
    console.log("❌ GET /courses - FAILED".red);
    console.log("   Error:", result.error);
  }

  // Test 2: Get Teacher Courses (corrected endpoint)
  console.log("\n2. Testing GET /courses/teacher (getTeacherCourses)");
  result = await makeRequest("GET", "/courses/teacher", null, teacherToken);
  if (result.success) {
    console.log("✅ GET /courses/teacher - SUCCESS".green);
    console.log(`   Found ${result.data.data?.length || 0} teacher courses`);
  } else {
    console.log("❌ GET /courses/teacher - FAILED".red);
    console.log("   Error:", result.error);
  }

  // Test 3: Get My Enrollments (corrected endpoint)
  console.log("\n3. Testing GET /enrollments/my (getMyEnrollments)");
  result = await makeRequest("GET", "/enrollments/my", null, studentToken);
  if (result.success) {
    console.log("✅ GET /enrollments/my - SUCCESS".green);
    console.log(`   Found ${result.data.data?.length || 0} enrollments`);
  } else {
    console.log("❌ GET /enrollments/my - FAILED".red);
    console.log("   Error:", result.error);
  }

  // Test 4: Get Enrollment Requests (using alternative endpoint)
  console.log(
    "\n4. Testing GET /enrollments/requests (getEnrollmentRequests)"
  );
  result = await makeRequest(
    "GET",
    "/enrollments/requests",
    null,
    adminToken
  );
  if (result.success) {
    console.log("✅ GET /enrollments/requests - SUCCESS".green);
    console.log(
      `   Found ${result.data.data?.length || 0} enrollment requests`
    );
  } else {
    console.log("❌ GET /enrollments/requests - FAILED".red);
    console.log("   Error:", JSON.stringify(result.error, null, 2));
  }

  // Test 5: Get Student Enrollment Requests (corrected endpoint)
  console.log(
    "\n5. Testing GET /enrollments/my/requests (getStudentEnrollmentRequests)"
  );
  result = await makeRequest(
    "GET",
    "/enrollments/my/requests",
    null,
    studentToken
  );
  if (result.success) {
    console.log("✅ GET /enrollments/my/requests - SUCCESS".green);
    console.log(`   Found ${result.data.data?.length || 0} student requests`);
  } else {
    console.log("❌ GET /enrollments/my/requests - FAILED".red);
    console.log("   Error:", result.error);
  }
}

async function testQuizServiceEndpoints() {
  console.log("\n🧩 Testing QuizService Endpoints...".cyan.bold);

  const teacherToken = authTokens.teacher;
  const studentToken = authTokens.student;

  // Test 1: Get Quizzes
  console.log("\n1. Testing GET /quizzes (getQuizzes)");
  let result = await makeRequest(
    "GET",
    "/quizzes?page=1&limit=5",
    null,
    teacherToken
  );
  if (result.success) {
    console.log("✅ GET /quizzes - SUCCESS".green);
    console.log(`   Found ${result.data.data?.data?.length || 0} quizzes`);
  } else {
    console.log("❌ GET /quizzes - FAILED".red);
    console.log("   Error:", result.error);
  }

  // Test 2: Can Student Take Quiz (if quiz exists)
  console.log("\n2. Testing GET /quizzes/:id/can-take (canStudentTakeQuiz)");
  // First get a quiz ID
  const quizzesResult = await makeRequest(
    "GET",
    "/quizzes",
    null,
    teacherToken
  );
  if (quizzesResult.success && quizzesResult.data.data?.data?.length > 0) {
    const quizId = quizzesResult.data.data.data[0].id;
    result = await makeRequest(
      "GET",
      `/quizzes/${quizId}/can-take`,
      null,
      studentToken
    );
    if (result.success) {
      console.log("✅ GET /quizzes/:id/can-take - SUCCESS".green);
      console.log(`   Can take quiz: ${result.data.data?.canTake || false}`);
    } else {
      console.log("❌ GET /quizzes/:id/can-take - FAILED".red);
      console.log("   Error:", result.error);
    }
  } else {
    console.log("⚠️  No quizzes found to test can-take endpoint".yellow);
  }

  // Test 3: Get Quiz Statistics (if quiz exists)
  console.log("\n3. Testing GET /quizzes/:id/statistics (getQuizStatistics)");
  if (quizzesResult.success && quizzesResult.data.data?.data?.length > 0) {
    const quizId = quizzesResult.data.data.data[0].id;
    result = await makeRequest(
      "GET",
      `/quizzes/${quizId}/statistics`,
      null,
      teacherToken
    );
    if (result.success) {
      console.log("✅ GET /quizzes/:id/statistics - SUCCESS".green);
      console.log(`   Total attempts: ${result.data.data?.totalAttempts || 0}`);
    } else {
      console.log("❌ GET /quizzes/:id/statistics - FAILED".red);
      console.log("   Error:", result.error);
    }
  } else {
    console.log("⚠️  No quizzes found to test statistics endpoint".yellow);
  }
}

async function testErrorHandling() {
  console.log("\n🚨 Testing Error Handling...".cyan.bold);

  // Test 1: Unauthorized request
  console.log("\n1. Testing unauthorized request");
  let result = await makeRequest("GET", "/users/users");
  if (!result.success && result.status === 401) {
    console.log("✅ Unauthorized error handling - SUCCESS".green);
    console.log("   Correctly returned 401 status");
  } else {
    console.log("❌ Unauthorized error handling - FAILED".red);
    console.log("   Expected 401 status, got:", result.status);
  }

  // Test 2: Invalid endpoint
  console.log("\n2. Testing invalid endpoint");
  result = await makeRequest(
    "GET",
    "/invalid-endpoint",
    null,
    authTokens.admin
  );
  if (!result.success && result.status === 404) {
    console.log("✅ Invalid endpoint error handling - SUCCESS".green);
    console.log("   Correctly returned 404 status");
  } else {
    console.log("❌ Invalid endpoint error handling - FAILED".red);
    console.log("   Expected 404 status, got:", result.status);
  }

  // Test 3: Invalid data format
  console.log("\n3. Testing invalid data format");
  result = await makeRequest("POST", "/auth/login", { invalid: "data" });
  if (!result.success && (result.status === 400 || result.status === 422)) {
    console.log("✅ Invalid data error handling - SUCCESS".green);
    console.log("   Correctly returned validation error");
  } else {
    console.log("❌ Invalid data error handling - FAILED".red);
    console.log("   Expected validation error, got:", result.status);
  }
}

async function testAPIConfiguration() {
  console.log("\n⚙️  Testing API Configuration...".cyan.bold);

  // Test 1: Base URL accessibility
  console.log("\n1. Testing API base URL accessibility");
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/check-email`, {
      timeout: 5000,
    });
    console.log("✅ API base URL accessible - SUCCESS".green);
  } catch (error) {
    if (error.response) {
      console.log("✅ API base URL accessible - SUCCESS".green);
      console.log("   Server responded (expected error for missing data)");
    } else {
      console.log("❌ API base URL not accessible - FAILED".red);
      console.log("   Error:", error.message);
    }
  }

  // Test 2: CORS headers
  console.log("\n2. Testing CORS configuration");
  try {
    const response = await axios.options(`${API_BASE_URL}/courses`);
    console.log("✅ CORS configuration - SUCCESS".green);
    console.log("   OPTIONS request successful");
  } catch (error) {
    console.log("⚠️  CORS configuration - WARNING".yellow);
    console.log("   OPTIONS request failed, but this might be expected");
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting API Endpoint Integration Tests...".rainbow.bold);
  console.log("=".repeat(60).gray);

  // Step 1: Test API Configuration
  await testAPIConfiguration();

  // Step 2: Authenticate users
  console.log("\n🔐 Authentication Phase...".cyan.bold);
  const authResults = await Promise.all([
    authenticate("admin"),
    authenticate("teacher"),
    authenticate("student"),
  ]);

  if (!authResults.every((result) => result)) {
    console.log(
      "\n❌ Some authentications failed. Continuing with available tokens..."
        .yellow
    );
  }

  // Step 3: Test service endpoints
  if (authTokens.admin) await testUserServiceEndpoints();
  if (authTokens.admin || authTokens.teacher || authTokens.student)
    await testCourseServiceEndpoints();
  if (authTokens.teacher || authTokens.student)
    await testQuizServiceEndpoints();

  // Step 4: Test error handling
  await testErrorHandling();

  // Summary
  console.log("\n" + "=".repeat(60).gray);
  console.log("🏁 API Endpoint Integration Tests Completed!".rainbow.bold);
  console.log("\nAuthenticated users:".cyan);
  Object.keys(authTokens).forEach((role) => {
    console.log(`  ✅ ${role}`.green);
  });

  console.log("\n📋 Test Summary:".cyan);
  console.log("  - UserService endpoints tested with corrected paths");
  console.log("  - CourseService endpoints tested with corrected paths");
  console.log("  - QuizService endpoints tested");
  console.log("  - Error handling scenarios tested");
  console.log("  - API configuration verified");

  console.log(
    "\n💡 Note: This test validates that frontend services use correct backend endpoints."
      .yellow
  );
}

// Run the tests
runTests().catch((error) => {
  console.error("💥 Test runner failed:".red.bold, error);
  process.exit(1);
});
