#pragma once
#include <string>
#include <regex>
#include <stack>

struct ValidationResult {
    bool is_valid;
    std::string error_msg;
};

ValidationResult validate_expression(const std::string& expression) {
    // 校验1：空字符串
    if (expression.empty() || expression.find_first_not_of(" \t\n") == std::string::npos) {
        return {false, "表达式不能为空"};
    }

    // 校验2：非法字符（仅允许数字、+-*/.()空格）
    std::regex valid_chars(R"(^[\d+\-*/.()\s]*$)");
    if (!std::regex_match(expression, valid_chars)) {
        return {false, "包含非法字符（仅支持数字、+-*/.()）"};
    }

    // 校验3：连续运算符（忽略空格）
    std::string stripped;
    for (char c : expression) {
        if (c != ' ') stripped += c;
    }
    if (std::regex_search(stripped, std::regex(R"([+*/\-]{2,})"))) {
        return {false, "存在连续运算符"};
    }

    // 校验4：首尾为运算符
    if (stripped.front() == '+' || stripped.front() == '-' || stripped.front() == '*' || stripped.front() == '/' ||
        stripped.back() == '+' || stripped.back() == '-' || stripped.back() == '*' || stripped.back() == '/') {
        return {false, "不能以运算符开头或结尾"};
    }

    // 校验5：括号匹配
    std::stack<char> brackets;
    for (char c : stripped) {
        if (c == '(') {
            brackets.push(c);
        } else if (c == ')') {
            if (brackets.empty()) return {false, "括号不匹配（右括号多余）"};
            brackets.pop();
        }
    }
    if (!brackets.empty()) {
        return {false, "括号不匹配（左括号多余）"};
    }

    return {true, ""};
}