# -*- coding: utf-8 -*-

from selenium.common.exceptions import NoSuchElementException

# 텍스트 문장이 영어인지 한글인지 판별 함수
def isEnglishOrKorean(driver):

    try:
        lang = driver.find_element_by_xpath('/html')
        lang = lang.get_attribute('lang')

    except NoSuchElementException:
        lang = 'en'

    print('Language of current page:', lang)
    return lang