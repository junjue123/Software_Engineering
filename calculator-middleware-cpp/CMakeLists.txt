cmake_minimum_required(VERSION 3.10)
project(calculator-middleware-cpp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找Pistache库
find_package(Pistache REQUIRED)
# 查找libcurl库
find_package(CURL REQUIRED)

include_directories(
    ${PISTACHE_INCLUDE_DIRS}
    ${CURL_INCLUDE_DIRS}
    ${CMAKE_SOURCE_DIR}  # 包含当前目录（用于config.h和validator.h）
)

add_executable(calculator-middleware main.cpp)
target_link_libraries(calculator-middleware
    ${PISTACHE_LIBRARIES}
    ${CURL_LIBRARIES}
)