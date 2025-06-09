#include <pistache/endpoint.h>
#include <pistache/router.h>
#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include "config.h"
#include "validator.h"

using namespace Pistache;
using json = nlohmann::json;

// 用于接收curl响应的回调函数
size_t write_callback(void* contents, size_t size, size_t nmemb, std::string* s) {
    size_t newLength = size * nmemb;
    try {
        s->append((char*)contents, newLength);
    } catch (std::bad_alloc& e) {
        return 0;
    }
    return newLength;
}

// 转发请求到后端的函数
std::string forward_to_backend(const std::string& expression) {
    CURL* curl = curl_easy_init();
    std::string response_string;

    if(curl) {
        json data = {{"expression", expression}};
        std::string post_data = data.dump();

        curl_easy_setopt(curl, CURLOPT_URL, BACKEND_CALCULATE_URL.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_string);

        CURLcode res = curl_easy_perform(curl);
        if(res != CURLE_OK) {
            return R"({"status":"error","data":{"error":"后端通信失败: )" + std::string(curl_easy_strerror(res)) + "}}";
        }
        long http_code = 0;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);
        if(http_code != 200) {
            return R"({"status":"error","data":{"error":"后端返回错误码: )" + std::to_string(http_code) + "}}";
        }
        curl_easy_cleanup(curl);
    }
    return R"({"status":"success","data":)" + response_string + "}";
}

// 主路由处理函数
void handle_validate_calculate(const Rest::Request& req, Http::ResponseWriter response) {
    try {
        auto json_body = json::parse(req.body());
        std::string expression = json_body["expression"].get<std::string>();

        auto validation = validate_expression(expression);
        if (!validation.is_valid) {
            response.send(Http::Code::Bad_Request, 
                R"({"status":"error","data":{"error":")" + validation.error_msg + "\"}}");
            return;
        }

        std::string backend_response = forward_to_backend(expression);
        response.send(Http::Code::Ok, backend_response);
    } catch (const std::exception& e) {
        response.send(Http::Code::Internal_Server_Error, 
            R"({"status":"error","data":{"error":")" + std::string(e.what()) + "\"}}");
    }
}

int main() {
    Address addr(Ipv4::any(), Port(5000));
    auto opts = Http::Endpoint::options().threads(2);
    Http::Endpoint server(addr);
    server.init(opts);

    Rest::Router router;
    Rest::Routes::Post(router, "/validate-calculate", Rest::Routes::bind(&handle_validate_calculate));

    server.setHandler(router.handler());
    server.serve();
    server.shutdown();
    return 0;
}