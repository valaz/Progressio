package ru.valaz.progressio.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.valaz.progressio.model.Record;

@Repository
public interface RecordRepository extends JpaRepository<Record, Long> {
}
