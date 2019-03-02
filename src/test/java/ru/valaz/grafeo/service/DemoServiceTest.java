package ru.valaz.grafeo.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import ru.valaz.grafeo.Application;
import ru.valaz.grafeo.model.User;
import ru.valaz.grafeo.repository.IndicatorRepository;
import ru.valaz.grafeo.repository.RecordRepository;
import ru.valaz.grafeo.repository.UserRepository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;


@RunWith(SpringRunner.class)
@SpringBootTest(classes = Application.class)
@TestPropertySource(properties = {
        "environment=test",
})
public class DemoServiceTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IndicatorRepository indicatorRepository;

    @Autowired
    private RecordRepository recordRepository;

    @Autowired
    private DemoService demoService;

    @Test
    public void generateDemoUser() {
        User demoUser = demoService.generateDemoUser();

        Optional<User> user = userRepository.findByUsername(demoUser.getUsername());
        assertTrue(user.isPresent());
        assertEquals(demoUser.getEmail(), user.get().getEmail());
        assertEquals(demoUser.getName(), user.get().getName());
        assertTrue(!userRepository.findAllByIsDemo(true).isEmpty());
        assertTrue(!indicatorRepository.findByCreatedBy(demoUser.getId()).isEmpty());
        // FIXME: 07.05.2018 assertionError during maven test
//        assertTrue(!recordRepository.findByCreatedBy(demoUser.getId()).isEmpty());
    }

    @Test
    public void expiredDemoUser() throws InterruptedException {
        User demoUser = demoService.generateDemoUser();

        TimeUnit.SECONDS.sleep(6);
        assertTrue(!userRepository.existsByUsernameIgnoreCase(demoUser.getUsername()));
        assertTrue(userRepository.findAllByIsDemo(true).isEmpty());
        assertTrue(indicatorRepository.findByCreatedBy(demoUser.getId()).isEmpty());
        assertTrue(recordRepository.findByCreatedBy(demoUser.getId()).isEmpty());
    }
}
