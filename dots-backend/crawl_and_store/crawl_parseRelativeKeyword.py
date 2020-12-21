# -*- coding: utf-8 -*-

from selenium.common.exceptions import NoSuchElementException

# 연관 키워드, url 추출 함수(검색창인 경우에만)
def parseRelativeKeyword(driver):

    relativeKeyword = {}

    try:
        relativeKeywordList = driver.find_element_by_xpath("//div[@id='brs']")

        for r in relativeKeywordList.find_elements_by_tag_name('a'):
            text = r.get_attribute('text')
            href = r.get_attribute('href')

            if '.' in text:
                text = text.replace('.', '-')

            relativeKeyword[text] = href

    except NoSuchElementException:
        pass

    return relativeKeyword