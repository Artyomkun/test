plugins {
    kotlin("jvm") version "1.9.23"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))
    testImplementation(files(
        "libs/kotlin-test-1.9.24.jar",
        "libs/junit-platform-console-standalone-1.10.2.jar", 
        "libs/junit-jupiter-params-5.10.2.jar",
        "libs/junit-jupiter-engine-5.10.2.jar",
        "libs/junit-jupiter-api-5.10.2.jar"
    ))
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(21)
}