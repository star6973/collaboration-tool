# -*- coding: utf-8 -*-

"""
    프론트엔드에서 사용자가 키워드를 입력하거나 페이지를 옮기면서 url이 변할 경우 메인 함수에 json 객체가 들어옴(현재 페이지, 이전 페이지, 레벨, 태그)
    url을 응답해서 그 url에 맞는 크롤링 방식 채택
"""

import json
import crawl_initiateChromeDriver
import crawl_parseKeyword
import crawl_parseKoreanContents
import crawl_parseEnglishContents
import crawl_isEnglishOrKorean
import crawl_parsePageList
import crawl_parseRelativeKeyword
import crawl_parseScreenshot
import crawl_saveMongoDB
import crawl_saveExcel
from datetime import datetime
from multiprocessing import Pool # 빠른 처리속도를 위해 멀티 프로세싱
import time

# class Main():
#     def __init__(self, jsonFile):
#         # 메인 함수에 들어오는 json 객체 파일 열기
#         with open(jsonFile, encoding='utf-8') as f:
#             data = json.loads(f.read())
#
#             self.user_name = data['user_name']
#             self.user_email = data['user_email']
#             self.curr_url = data['curr_url']
#             self.prev_url = data['prev_url']
#             self.paths = data['paths']
#             self.level = data['level']
#             self.tagged = data['tagged']
#             self.memo = data['memo']
#             self.project_name = data['project_name']
#
#         # 현재 페이지에 대한 크롤링 준비
#         self.driver = crawl_initiateChromeDriver.initiateChromeDriver()
#         self.driver.get(self.curr_url)
#         self.driver.implicitly_wait(2)
#
#     def crawl_data(self):
#         # 검색 페이지인 경우를 알기 위한 변수
#         search_page1 = 'https://www.google.com/search?'
#         search_page2 = 'https://www.google.co.kr/search?'
#
#         # 검색 페이지인 경우
#         if search_page1 in self.curr_url or search_page2 in self.curr_url:
#             print('검색 페이지인 경우')
#             self.keyword = crawl_parseKeyword.parseKeywordSearchPage(self.driver)
#             self.pageList = crawl_parsePageList.parsePageList(self.driver)
#             self.relativeKeywordList = crawl_parseRelativeKeyword.parseRelativeKeyword(self.driver)
#             self.pageContents = []
#             self.sub_keyword = []
#             # screenshot = crawl_parseScreenshot.parseScreenshot(driver, user_name, keyword)
#             self.nowTime = datetime.now()
#
#         # 홈페이지인 경우
#         else:
#             print('홈페이지인 경우')
#             self.keyword = crawl_parseKeyword.parseKeywordHomePage(self.driver)
#             self.pageList = []
#             self.relativeKeywordList = []
#
#             # 서브 키워드 및 본문 요약은 페이지의 언어에 따라 다르다.
#             if crawl_isEnglishOrKorean.isEnglishOrKorean(self.driver) == 'ko' or 'ko-KR':
#                 textrank = crawl_parseKoreanContents.TextRank(self.curr_url)
#                 self.pageContents = textrank.summarize(5)
#                 self.sub_keyword = textrank.keywords()
#             else:
#                 textrank = crawl_parseEnglishContents.TextRank(self.curr_url)
#                 self.pageContents = textrank.summarize(5)
#                 self.sub_keyword = textrank.keywords()
#
#             # screenshot = crawl_parseScreenshot.parseScreenshot(driver, user_name, keyword)
#             self.nowTime = datetime.now()
#
#         # 드라이버 연결 끊기
#         self.driver.close()
#
#     def store(self):
#         # # 추출된 아이템들을 몽고 DB에 저장
#         crawl_saveMongoDB.store_mongoDB(self.user_name, self.user_email, self.curr_url, self.prev_url, self.pageList,
#                                         self.relativeKeywordList, self.level, self.paths, self.keyword, self.sub_keyword,
#                                         self.pageContents, self.memo, self.tagged, self.nowTime, self.project_name)

def main(jsonFile):
    # 검색 페이지인 경우를 알기 위한 변수
    search_page1 = 'https://www.google.com/search?'
    search_page2 = 'https://www.google.co.kr/search?'

    # 메인 함수에 들어오는 json 객체 파일 열기
    # with open(jsonFile, encoding='utf-8') as f:
    #     data = json.loads(f.read())

    #     user_name = data['user_name']
    #     user_email = data['user_email']
    #     curr_url = data['curr_url']
    #     prev_url = data['prev_url']
    #     paths = data['paths']
    #     level = data['level']
    #     tagged = data['tagged']
    #     memo = data['memo']
    #     project_name = data['project_name']

    # 메인 함수에 들어오는 json 객체 열기
    # data = json.loads(jsonFile)
    data = jsonFile

    user_name = data['user_name']
    user_email = data['user_email']
    curr_url = data['curr_url']
    prev_url = data['prev_url']
    paths = data['paths']
    level = data['level']
    tagged = data['tagged']
    memo = data['memo']
    project_name = data['project_name']

    # 현재 페이지에 대한 크롤링 준비
    print('--- Driver setting start ---')
    driver = crawl_initiateChromeDriver.initiateChromeDriver()
    driver.get(curr_url)
    driver.implicitly_wait(2)
    print('--- Driver setting complete ---')

    # 검색 페이지인 경우
    if search_page1 in curr_url or search_page2 in curr_url:
        print('검색 페이지인 경우')
        user_name = user_name
        user_email = user_email
        keyword = crawl_parseKeyword.parseKeywordSearchPage(driver)
        curr_url = curr_url
        prev_url = prev_url
        pageList = crawl_parsePageList.parsePageList(driver)
        relativeKeywordList = crawl_parseRelativeKeyword.parseRelativeKeyword(driver)
        pageContents = []
        sub_keyword = []
        tagged = tagged
        memo = memo
        # screenshot = crawl_parseScreenshot.parseScreenshot(driver, user_name, keyword)
        nowTime = datetime.now()

    # 홈페이지인 경우
    else:
        print('홈페이지인 경우')
        user_name = user_name
        user_email = user_email
        keyword = crawl_parseKeyword.parseKeywordHomePage(driver)
        curr_url = curr_url
        prev_url = prev_url
        pageList = []
        relativeKeywordList = []

        # 서브 키워드 및 본문 요약은 페이지의 언어에 따라 다르다.
        print('--- Textrank process start ---')
        # if crawl_isEnglishOrKorean.isEnglishOrKorean(driver) == 'ko' or 'ko-KR':
        if crawl_isEnglishOrKorean.isEnglishOrKorean(driver) == 'ko' or crawl_isEnglishOrKorean.isEnglishOrKorean(driver) == 'ko-KR':
            textrank = crawl_parseKoreanContents.TextRank(curr_url)
        else:
            textrank = crawl_parseEnglishContents.TextRank(curr_url)
        print('--- Textrank process complete ---')
        print('--- Summarizing start ---')
        pageContents = textrank.summarize(5)
        sub_keyword = textrank.keywords()
        print('--- Summarizing complete ---')

        tagged = tagged
        memo = memo
        # screenshot = crawl_parseScreenshot.parseScreenshot(driver, user_name, keyword)
        nowTime = datetime.now()

    # 추출된 아이템들을 몽고 DB에 저장
    print('--- Saving data in DB ---')
    crawl_saveMongoDB.store_mongoDB(user_name, user_email, curr_url, prev_url, pageList, relativeKeywordList, level, paths, keyword, sub_keyword, pageContents, memo, tagged, nowTime, project_name)
    print('--- DB save complete ---')

    # # 추출된 아이템들을 엑셀에 저장
    # crawl_saveExcel.make_excel(user_name, keyword)
    # crawl_saveExcel.crawl_saveExcel(user_name, user_email, curr_url, prev_url, pageList, relativeKeywordList, level, paths, keyword, sub_keyword, pageContents, memo, tagged, str(nowTime))

    # 드라이버 연결 끊기
    driver.close()
    # driver.quit()

    return 'success'

if __name__ == '__main__':
    main()

    # pool = Pool(processes=4)

    # json = ['C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_1.json',
    #         'C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_2.json',
    #         'C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_3.json',
    #         'C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_4.json',
    #         'C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_5.json']

    # start_time = time.time()

    # pool.map(main, json)

    # print("--- %s seconds ---" % (time.time() - start_time))

    # start_time = time.time()
    # main1 = Main('C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_1.json')
    # main1.crawl_data()
    # print("--- %s seconds ---" % (time.time() - start_time))
    #
    # start_time = time.time()
    # main2 = Main('C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_2.json')
    # main2.crawl_data()
    # print("--- %s seconds ---" % (time.time() - start_time))
    #
    # start_time = time.time()
    # main3 = Main('C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_3.json')
    # main3.crawl_data()
    # print("--- %s seconds ---" % (time.time() - start_time))
    #
    # start_time = time.time()
    # main4 = Main('C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_4.json')
    # main4.crawl_data()
    # print("--- %s seconds ---" % (time.time() - start_time))
    #
    # start_time = time.time()
    # main5 = Main('C:/Users/battl/PycharmProjects/ComputerScienceEngineering/project list/Data Acquisition and Visualization System for Team Projects/Selenium/json/5_5.json')
    # main5.crawl_data()
    # print("--- %s seconds ---" % (time.time() - start_time))
